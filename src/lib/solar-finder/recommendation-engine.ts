import type {
  ApplianceSelection,
  SolarFinderFormData,
  RecommendationResult,
  PropertyType,
  BackupDuration,
  UsagePattern,
  BudgetRange,
} from "@/types/solar-finder";
import { getFinderPackages, type FinderPackage } from "./packages";
import { getApplianceById } from "./appliances";

const DISCLAIMER =
  "Package recommendations are preliminary and based on the information provided. Final system sizing may require confirmation by a Winsay solar specialist.";

const propertyComplexityScores: Record<PropertyType, number> = {
  "1-2-room": 1,
  "3-4-room": 2,
  "5-plus-room": 3,
  "large-family-home": 4,
  apartment: 2,
  farm: 5,
  shop: 3,
  office: 3,
  school: 5,
  "lodge-guest-house": 5,
  "other-business": 4,
};

const backupDurationMultipliers: Record<BackupDuration, number> = {
  "2-4-hours": 0.5,
  "4-8-hours": 1,
  "8-12-hours": 1.5,
  overnight: 2,
  "full-day": 3,
  "not-sure": 1,
};

const usageIntensityMultipliers: Record<UsagePattern, number> = {
  "during-loadshedding": 1,
  "every-night": 1.2,
  "day-and-night": 2,
  "business-continuity": 1.8,
  "off-grid": 3,
  "not-sure": 1,
};

const budgetMaxMap: Record<BudgetRange, number | null> = {
  "under-1000": 1000,
  "1000-1500": 1500,
  "1500-2500": 2500,
  "2500-3500": 3500,
  "above-3500": null,
  flexible: null,
  "expert-advice": null,
};

export function calculateLoads(
  appliances: ApplianceSelection[]
): { continuousWatts: number; surgeWatts: number } {
  let continuousWatts = 0;
  let surgeWatts = 0;

  for (const selection of appliances) {
    const appliance = getApplianceById(selection.applianceId);
    if (!appliance) continue;

    const qty = Math.max(1, selection.quantity);
    const continuous = appliance.estimatedWatts * qty;
    const surge = continuous * appliance.surgeMultiplier;

    continuousWatts += continuous;
    surgeWatts += surge;
  }

  return { continuousWatts, surgeWatts };
}

export function calculateUsageIntensity(
  backupDuration: BackupDuration | null,
  usagePattern: UsagePattern | null
): number {
  const durMult = backupDuration ? backupDurationMultipliers[backupDuration] : 1;
  const usageMult = usagePattern ? usageIntensityMultipliers[usagePattern] : 1;
  return durMult * usageMult;
}

export function requiresExpertReview(
  continuousWatts: number,
  surgeWatts: number,
  propertyType: PropertyType | null,
  appliances: ApplianceSelection[]
): boolean {
  const hasHighSurge = surgeWatts > continuousWatts * 2.5;
  const hasLargeProperty =
    propertyType === "farm" ||
    propertyType === "school" ||
    propertyType === "lodge-guest-house";
  const hasPump = appliances.some(
    (a) => a.applianceId === "borehole-pump" || a.applianceId === "water-pump"
  );
  const hasHighLoad = continuousWatts > 5000;
  const hasBusiness = appliances.some(
    (a) =>
      a.applianceId === "shop-equipment" || a.applianceId === "office-equipment"
  );

  return hasHighSurge || hasLargeProperty || hasPump || hasHighLoad || hasBusiness;
}

export function isBudgetMismatch(
  budget: BudgetRange | null,
  requiredPrice: number
): boolean {
  if (!budget) return false;
  const max = budgetMaxMap[budget];
  if (max === null) return false;
  return requiredPrice > max;
}

export function getBudgetMessage(budget: BudgetRange | null): string | null {
  if (!budget) return null;
  const max = budgetMaxMap[budget];
  if (max === null) return null;
  return `Based on what you selected, your power needs may require a larger system than your current budget range. We recommend speaking with the Winsay team for the safest and most cost-effective configuration.`;
}

function scorePackage(
  pkg: FinderPackage,
  continuousWatts: number,
  surgeWatts: number,
  usageIntensity: number,
  propertyComplexity: number,
  budget: BudgetRange | null
): number {
  const inverterVA = pkg.kvaRating * 1000;
  const continuousScore = scoreContinuousFit(inverterVA, continuousWatts);
  const surgeScore = scoreSurgeFit(inverterVA, surgeWatts);
  const usageScore = scoreUsageFit(pkg, usageIntensity);
  const propertyScore = scorePropertyFit(pkg, propertyComplexity);
  const budgetScore = scoreBudgetFit(pkg.basePriceUsd, budget);

  return continuousScore * 0.35 + surgeScore * 0.25 + usageScore * 0.15 + propertyScore * 0.1 + budgetScore * 0.15;
}

function scoreContinuousFit(inverterVA: number, continuousWatts: number): number {
  const ratio = continuousWatts / inverterVA;
  if (ratio <= 0.5) return 90;
  if (ratio <= 0.7) return 100;
  if (ratio <= 0.85) return 80;
  if (ratio <= 1.0) return 50;
  return 20;
}

function scoreSurgeFit(inverterVA: number, surgeWatts: number): number {
  const ratio = surgeWatts / inverterVA;
  if (ratio <= 0.7) return 100;
  if (ratio <= 0.9) return 80;
  if (ratio <= 1.2) return 50;
  return 20;
}

function scoreUsageFit(pkg: FinderPackage, usageIntensity: number): number {
  const capacity = pkg.kvaRating * pkg.panelCount;
  if (usageIntensity <= 1) return capacity >= 10 ? 90 : 100;
  if (usageIntensity <= 2) return capacity >= 20 ? 100 : 70;
  if (usageIntensity <= 3) return capacity >= 40 ? 100 : 50;
  return capacity >= 60 ? 100 : 30;
}

function scorePropertyFit(pkg: FinderPackage, propertyComplexity: number): number {
  if (propertyComplexity <= 2) return pkg.kvaRating <= 5 ? 100 : 80;
  if (propertyComplexity <= 3) return pkg.kvaRating >= 3.5 && pkg.kvaRating <= 10 ? 100 : 60;
  if (propertyComplexity <= 4) return pkg.kvaRating >= 8 ? 100 : 40;
  return pkg.kvaRating >= 10 ? 100 : 20;
}

function scoreBudgetFit(price: number, budget: BudgetRange | null): number {
  if (!budget || budget === "flexible" || budget === "expert-advice" || budget === "above-3500") {
    return 100;
  }
  const max = budgetMaxMap[budget];
  if (max === null) return 100;
  if (price <= max) return 100;
  const overage = (price - max) / max;
  if (overage <= 0.1) return 80;
  if (overage <= 0.3) return 50;
  return 20;
}

function generateReason(
  primary: FinderPackage,
  continuousWatts: number,
  propertyType: PropertyType | null,
  budget: BudgetRange | null
): string {
  const parts: string[] = [];

  const ratio = continuousWatts / (primary.kvaRating * 1000);

  if (primary.kvaRating <= 5) {
    if (ratio <= 0.5) {
      parts.push("A practical starting point for households that need reliable backup for essential everyday appliances.");
    } else {
      parts.push("A solid entry-level system designed to keep your essential appliances running during power cuts.");
    }
  } else if (primary.kvaRating <= 8.2) {
    parts.push("A well-balanced mid-range system that provides dependable backup for a typical household with multiple appliances.");
  } else if (primary.kvaRating <= 10.2) {
    parts.push("A high-capacity solution built for larger homes or properties with higher energy demands.");
  } else {
    parts.push("A powerful system designed for properties with substantial energy requirements.");
  }

  if (propertyType === "farm" || propertyType === "lodge-guest-house" || propertyType === "school") {
    parts.push("Given your property type, this package provides a stronger starting point than smaller systems.");
  }

  if (budget === "flexible" || budget === "above-3500" || budget === null) {
    if (primary.kvaRating >= 8) {
      parts.push("This package offers excellent value and capacity for your requirements.");
    }
  }

  return parts.join(" ");
}

function findUpgrade(
  primaryId: string,
  continuousWatts: number,
  surgeWatts: number
): FinderPackage | null {
  const packages = getFinderPackages();
  const primaryIndex = packages.findIndex((p) => p.id === primaryId);
  if (primaryIndex === -1 || primaryIndex >= packages.length - 1) return null;

  const candidates = packages.slice(primaryIndex + 1);
  for (const candidate of candidates) {
    const inverterVA = candidate.kvaRating * 1000;
    if (inverterVA >= surgeWatts * 1.1 && inverterVA >= continuousWatts * 1.3) {
      return candidate;
    }
  }
  return null;
}

export interface RecommendationInput {
  appliances: ApplianceSelection[];
  propertyType: PropertyType | null;
  backupDuration: BackupDuration | null;
  usagePattern: UsagePattern | null;
  budget: BudgetRange | null;
}

export function generateRecommendation(input: RecommendationInput): RecommendationResult {
  const { appliances, propertyType, backupDuration, usagePattern, budget } = input;
  const packages = getFinderPackages();

  const { continuousWatts, surgeWatts } = calculateLoads(appliances);
  const usageIntensity = calculateUsageIntensity(backupDuration, usagePattern);
  const propertyComplexity = propertyType ? propertyComplexityScores[propertyType] : 2;
  const expertReview = requiresExpertReview(continuousWatts, surgeWatts, propertyType, appliances);

  if (packages.length === 0) {
    throw new Error("No solar packages available");
  }

  const scored = packages
    .filter((p) => p.available)
    .map((pkg) => ({
      pkg,
      score: scorePackage(pkg, continuousWatts, surgeWatts, usageIntensity, propertyComplexity, budget),
    }));

  scored.sort((a, b) => b.score - a.score);

  const topScore = scored[0];
  if (!topScore) {
    throw new Error("No suitable package found");
  }

  const budgetMsg = getBudgetMessage(budget);
  const budgetMismatch = budget ? isBudgetMismatch(budget, topScore.pkg.basePriceUsd) : false;

  const reasonParts: string[] = [];
  reasonParts.push(generateReason(topScore.pkg, continuousWatts, propertyType, budget));
  if (budgetMismatch && budgetMsg) {
    reasonParts.push(budgetMsg);
  }
  if (expertReview) {
    reasonParts.push("We recommend an expert review for your specific requirements to ensure the safest configuration.");
  }

  const upgrade = findUpgrade(topScore.pkg.id, continuousWatts, surgeWatts);
  const budgetMismatchFlag = budgetMismatch;

  return {
    primaryPackageId: topScore.pkg.id,
    primaryPackageName: topScore.pkg.name,
    primaryPackagePrice: topScore.pkg.basePriceUsd,
    primaryPackageSpecs: topScore.pkg.specs,
    primaryPackageImage: topScore.pkg.image,
    upgradePackageId: upgrade?.id || null,
    upgradePackageName: upgrade?.name || null,
    upgradePackagePrice: upgrade?.basePriceUsd || null,
    upgradePackageSpecs: upgrade?.specs || null,
    upgradePackageImage: upgrade?.image || null,
    estimatedContinuousLoad: continuousWatts,
    estimatedSurgeLoad: surgeWatts,
    budgetMismatch: budgetMismatchFlag,
    expertReviewRequired: expertReview,
    reason: reasonParts.join(" "),
    disclaimer: DISCLAIMER,
  };
}

export function generateRecommendationFromForm(
  formData: SolarFinderFormData
): RecommendationResult {
  return generateRecommendation({
    appliances: formData.appliances,
    propertyType: formData.propertyType,
    backupDuration: formData.backupDuration,
    usagePattern: formData.usagePattern,
    budget: formData.budget,
  });
}
