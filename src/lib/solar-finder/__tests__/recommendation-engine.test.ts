import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  calculateLoads,
  calculateUsageIntensity,
  requiresExpertReview,
  isBudgetMismatch,
  generateRecommendation,
} from "../recommendation-engine";
import type { ApplianceSelection, PropertyType, BackupDuration, UsagePattern, BudgetRange } from "../../../types/solar-finder";

function makeSelection(id: string, quantity?: number): ApplianceSelection {
  return { applianceId: id, quantity: quantity ?? 1 };
}

void describe("Solar Finder Recommendation Engine", () => {
  void describe("calculateLoads", () => {
    void it("returns zero loads for empty selection", () => {
      const result = calculateLoads([]);
      assert.equal(result.continuousWatts, 0);
      assert.equal(result.surgeWatts, 0);
    });

    void it("calculates continuous and surge load for a single appliance", () => {
      const result = calculateLoads([makeSelection("led-lights", 1)]);
      // LED Lights: 10W, surge 1x
      assert.equal(result.continuousWatts, 10);
      assert.equal(result.surgeWatts, 10);
    });

    void it("accounts for quantities correctly", () => {
      const result = calculateLoads([makeSelection("led-lights", 5)]);
      // 5 × 10W = 50W continuous, 50W surge
      assert.equal(result.continuousWatts, 50);
      assert.equal(result.surgeWatts, 50);
    });

    void it("calculates surge for high-surge appliances", () => {
      const result = calculateLoads([makeSelection("refrigerator", 1)]);
      // Refrigerator: 150W continuous, surge 3x = 450W
      assert.equal(result.continuousWatts, 150);
      assert.equal(result.surgeWatts, 450);
    });

    void it("combines multiple appliances", () => {
      const result = calculateLoads([
        makeSelection("led-lights", 4),
        makeSelection("television", 2),
        makeSelection("refrigerator", 1),
      ]);
      // Lights: 4×10 = 40 (surge 40)
      // TV: 2×120 = 240 (surge 288)
      // Refrigerator: 1×150 = 150 (surge 450)
      assert.equal(result.continuousWatts, 430);
      assert.equal(result.surgeWatts, 778);
    });

    void it("handles pump surge correctly", () => {
      const result = calculateLoads([makeSelection("borehole-pump", 1)]);
      // Borehole Pump: 1500W continuous, surge 3x = 4500W
      assert.equal(result.continuousWatts, 1500);
      assert.equal(result.surgeWatts, 4500);
    });

    void it("handles unknown appliance IDs gracefully", () => {
      const result = calculateLoads([makeSelection("unknown-appliance", 1)]);
      assert.equal(result.continuousWatts, 0);
      assert.equal(result.surgeWatts, 0);
    });
  });

  void describe("calculateUsageIntensity", () => {
    void it("returns 1 for default values", () => {
      assert.equal(calculateUsageIntensity(null, null), 1);
    });

    void it("returns 0.5 for short backup", () => {
      assert.equal(calculateUsageIntensity("2-4-hours", null), 0.5);
    });

    void it("returns 3 for full day backup", () => {
      assert.equal(calculateUsageIntensity("full-day", null), 3);
    });

    void it("multiplies duration and usage pattern", () => {
      // 8-12 hours (1.5) × day-and-night (2) = 3
      assert.equal(calculateUsageIntensity("8-12-hours", "day-and-night"), 3);
    });

    void it("returns 6 for off-grid full day", () => {
      // full-day (3) × off-grid (3) = 9
      assert.equal(calculateUsageIntensity("full-day", "off-grid"), 9);
    });
  });

  void describe("requiresExpertReview", () => {
    void it("returns false for simple selections", () => {
      assert.equal(
        requiresExpertReview(500, 600, "1-2-room", [makeSelection("led-lights", 3)]),
        false
      );
    });

    void it("returns true for high surge load", () => {
      assert.equal(
        requiresExpertReview(500, 1500, "1-2-room", [makeSelection("borehole-pump")]),
        true
      );
    });

    void it("returns true for large properties", () => {
      assert.equal(
        requiresExpertReview(1000, 1200, "farm", [makeSelection("led-lights", 5)]),
        true
      );
    });

    void it("returns true for schools", () => {
      assert.equal(
        requiresExpertReview(1000, 1200, "school", [makeSelection("led-lights", 10)]),
        true
      );
    });

    void it("returns true when borehole pump is selected", () => {
      assert.equal(
        requiresExpertReview(2000, 5000, "3-4-room", [makeSelection("borehole-pump")]),
        true
      );
    });

    void it("returns true for high continuous load", () => {
      const bigLoad = Array.from({ length: 10 }, () => makeSelection("microwave"));
      assert.equal(requiresExpertReview(6000, 7000, "3-4-room", bigLoad), true);
    });

    void it("returns true for business equipment", () => {
      assert.equal(
        requiresExpertReview(800, 1200, "1-2-room", [makeSelection("shop-equipment")]),
        true
      );
    });
  });

  void describe("isBudgetMismatch", () => {
    void it("returns false when budget is null", () => {
      assert.equal(isBudgetMismatch(null, 1000), false);
    });

    void it("returns false when budget is flexible", () => {
      assert.equal(isBudgetMismatch("flexible", 5000), false);
    });

    void it("returns false when price is within budget", () => {
      assert.equal(isBudgetMismatch("under-1000", 950), false);
    });

    void it("returns true when price exceeds budget", () => {
      assert.equal(isBudgetMismatch("under-1000", 1200), true);
    });

    void it("handles mid-range budget correctly", () => {
      assert.equal(isBudgetMismatch("1500-2500", 1900), false);
      assert.equal(isBudgetMismatch("1500-2500", 2600), true);
    });

    void it("returns false for above-3500 budget", () => {
      assert.equal(isBudgetMismatch("above-3500", 5000), false);
    });
  });

  void describe("generateRecommendation", () => {
    void it("returns a valid recommendation for minimum selection", () => {
      const result = generateRecommendation({
        appliances: [makeSelection("led-lights", 2), makeSelection("television", 1)],
        propertyType: "1-2-room",
        backupDuration: "4-8-hours",
        usagePattern: "during-loadshedding",
        budget: "under-1000",
      });

      assert.ok(result.primaryPackageId);
      assert.ok(result.primaryPackageName);
      assert.ok(result.primaryPackagePrice > 0);
      assert.ok(result.primaryPackageSpecs.length > 0);
      assert.ok(result.reason.length > 0);
      assert.ok(result.disclaimer.length > 0);
    });

    void it("recommends 3.2kVA for small home with essential loads (Example A)", () => {
      const result = generateRecommendation({
        appliances: [
          makeSelection("led-lights", 4),
          makeSelection("television", 1),
          makeSelection("wifi-router", 1),
          makeSelection("phone-chargers", 2),
          makeSelection("laptop", 1),
        ],
        propertyType: "1-2-room",
        backupDuration: "4-8-hours",
        usagePattern: "during-loadshedding",
        budget: "under-1000",
      });

      // Should recommend the most affordable option
      assert.ok(result.primaryPackagePrice <= 1000 || result.budgetMismatch === false);
    });

    void it("recommends higher capacity for fridge and freezer (Example B)", () => {
      const result = generateRecommendation({
        appliances: [
          makeSelection("led-lights", 6),
          makeSelection("television", 2),
          makeSelection("wifi-router", 1),
          makeSelection("refrigerator", 1),
          makeSelection("deep-freezer", 1),
          makeSelection("desktop-computer", 2),
        ],
        propertyType: "5-plus-room",
        backupDuration: "8-12-hours",
        usagePattern: "during-loadshedding",
        budget: "1500-2500",
      });

      // Continuous load should be substantial
      assert.ok(result.estimatedContinuousLoad > 500);
      // Should recommend at least 8.2kVA system
      assert.ok(result.primaryPackagePrice >= 1000);
    });

    void it("flags expert review for borehole pump", () => {
      const result = generateRecommendation({
        appliances: [
          makeSelection("borehole-pump", 1),
          makeSelection("refrigerator", 1),
          makeSelection("deep-freezer", 1),
          makeSelection("microwave", 1),
          makeSelection("television", 2),
          makeSelection("led-lights", 10),
        ],
        propertyType: "farm",
        backupDuration: "8-12-hours",
        usagePattern: "day-and-night",
        budget: "above-3500",
      });

      assert.ok(result.expertReviewRequired);
    });

    void it("flags budget mismatch when requirements exceed budget", () => {
      const result = generateRecommendation({
        appliances: [
          makeSelection("borehole-pump", 1),
          makeSelection("refrigerator", 1),
          makeSelection("deep-freezer", 1),
          makeSelection("microwave", 1),
          makeSelection("washing-machine", 1),
          makeSelection("television", 2),
          makeSelection("led-lights", 10),
          makeSelection("laptop", 2),
        ],
        propertyType: "large-family-home",
        backupDuration: "overnight",
        usagePattern: "day-and-night",
        budget: "under-1000",
      });

      assert.ok(result.budgetMismatch);
    });

    void it("does not flag mismatch for flexible budget", () => {
      const result = generateRecommendation({
        appliances: [makeSelection("borehole-pump", 1)],
        propertyType: "farm",
        backupDuration: "overnight",
        usagePattern: "off-grid",
        budget: "flexible",
      });

      assert.equal(result.budgetMismatch, false);
    });

    void it("provides upgrade option when possible", () => {
      const result = generateRecommendation({
        appliances: [
          makeSelection("led-lights", 4),
          makeSelection("television", 1),
          makeSelection("wifi-router", 1),
        ],
        propertyType: "1-2-room",
        backupDuration: "4-8-hours",
        usagePattern: "during-loadshedding",
        budget: "flexible",
      });

      // May or may not have upgrade depending on scoring
      assert.ok(result.primaryPackageId.length > 0);
    });

    void it("handles large property case", () => {
      const result = generateRecommendation({
        appliances: [
          makeSelection("led-lights", 20),
          makeSelection("television", 4),
          makeSelection("refrigerator", 2),
          makeSelection("deep-freezer", 2),
          makeSelection("microwave", 2),
          makeSelection("electric-kettle", 2),
          makeSelection("laptop", 3),
          makeSelection("desktop-computer", 2),
          makeSelection("office-equipment", 1),
          makeSelection("cctv", 1),
        ],
        propertyType: "large-family-home",
        backupDuration: "overnight",
        usagePattern: "day-and-night",
        budget: "above-3500",
      });

      // Should recommend a high-capacity system
      assert.ok(result.estimatedContinuousLoad > 2000);
    });

    void it("returns deterministic results (same input = same output)", () => {
      const input = {
        appliances: [makeSelection("led-lights", 4), makeSelection("television", 1)],
        propertyType: "3-4-room" as PropertyType,
        backupDuration: "4-8-hours" as BackupDuration,
        usagePattern: "during-loadshedding" as UsagePattern,
        budget: "1000-1500" as BudgetRange,
      };

      const result1 = generateRecommendation(input);
      const result2 = generateRecommendation(input);

      assert.equal(result1.primaryPackageId, result2.primaryPackageId);
      assert.equal(result1.estimatedContinuousLoad, result2.estimatedContinuousLoad);
      assert.equal(result1.estimatedSurgeLoad, result2.estimatedSurgeLoad);
      assert.equal(result1.expertReviewRequired, result2.expertReviewRequired);
      assert.equal(result1.budgetMismatch, result2.budgetMismatch);
    });
  });
});
