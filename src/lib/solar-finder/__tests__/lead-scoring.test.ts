import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { calculateLeadScore, type SubmitSolarFinderLeadData } from "../db";

const baseLead: SubmitSolarFinderLeadData = {
  fullName: "Test Customer",
  whatsappNumber: "+263785293587",
  email: "",
  city: "Harare",
  suburb: "Avondale",
  appliances: [],
  propertyType: "3-4-room",
  backupDuration: "4-8-hours",
  usagePattern: "during-loadshedding",
  budget: "1500-2500",
  installationTimeline: "researching",
  recommendedPackageId: "pkg-3.5",
  recommendedPackageName: "3.5Kva System",
  upgradePackageId: null,
  upgradePackageName: null,
  estimatedContinuousLoad: 1200,
  estimatedSurgeLoad: 1800,
  expertReviewRequired: false,
};

void describe("lead scoring", () => {
  void it("scores immediate, complete enquiries as hot", () => {
    const result = calculateLeadScore({
      ...baseLead,
      email: "customer@example.com",
      installationTimeline: "immediately",
    });

    assert.equal(result.temperature, "hot");
    assert.equal(result.score, 85);
  });

  void it("penalizes low-budget high-load mismatches", () => {
    const result = calculateLeadScore({
      ...baseLead,
      budget: "under-1000",
      estimatedContinuousLoad: 3200,
    });

    assert.equal(result.temperature, "warm");
    assert.equal(result.score, 40);
  });
});
