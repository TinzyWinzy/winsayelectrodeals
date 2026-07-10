import type { Package, RoofType } from "@/types";
import { roofTypeSurcharges, provinceSurcharges } from "@/types";

export const FULL_PREPAY_DISCOUNT = 0.05;

export interface QuotePricingInput {
  pkg: Package;
  roofType: RoofType;
  province: string;
  payAfterInstall: boolean;
  zigRate: number;
}

export interface QuotePricing {
  baseUsd: number;
  roofSurchargeUsd: number;
  provinceSurchargeUsd: number;
  totalUsd: number;
  totalZig: number;
  depositUsd: number;
  depositZig: number;
}

export function getDepositPercentage(kvaRating: number): number {
  if (kvaRating < 5) return 0.3;
  if (kvaRating <= 8) return 0.4;
  return 0.5;
}

export function calculateQuotePricing({
  pkg,
  roofType,
  province,
  payAfterInstall,
  zigRate,
}: QuotePricingInput): QuotePricing {
  const baseUsd = pkg.basePriceUsd;
  const roofSurchargeUsd = roofTypeSurcharges[roofType] || 0;
  const provinceSurchargeUsd = provinceSurcharges[province] || 0;

  let totalUsd = baseUsd + roofSurchargeUsd + provinceSurchargeUsd;

  // Full prepay gets a discount
  if (!payAfterInstall) {
    totalUsd = totalUsd * (1 - FULL_PREPAY_DISCOUNT);
  }

  totalUsd = round(totalUsd);

  const totalZig = round(totalUsd * zigRate);

  const depositPct = getDepositPercentage(pkg.kvaRating);
  const depositUsd = payAfterInstall
    ? round(totalUsd * depositPct)
    : totalUsd;
  const depositZig = round(depositUsd * zigRate);

  return {
    baseUsd,
    roofSurchargeUsd,
    provinceSurchargeUsd,
    totalUsd,
    totalZig,
    depositUsd,
    depositZig,
  };
}

function round(value: number): number {
  return Math.round(value * 100) / 100;
}
