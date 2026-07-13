import { fallbackPackages, getPackageImage } from "@/lib/fallback-data";
import type { Package } from "@/types";

export interface FinderPackage {
  id: string;
  name: string;
  kvaRating: number;
  panelCount: number;
  batterySpec: string;
  inverterBrand: string;
  basePriceUsd: number;
  freeGift: string | null;
  specs: string[];
  badge?: string;
  image: string;
  wifiEnabled?: boolean;
  available: boolean;
}

function toFinderPackage(pkg: Package): FinderPackage {
  return {
    id: pkg.id,
    name: pkg.name,
    kvaRating: pkg.kvaRating,
    panelCount: pkg.panelCount,
    batterySpec: pkg.batterySpec,
    inverterBrand: pkg.inverterBrand,
    basePriceUsd: pkg.basePriceUsd,
    freeGift: pkg.freeGift,
    specs: pkg.specs || [],
    badge: pkg.badge,
    image: getPackageImage(pkg.kvaRating),
    wifiEnabled: pkg.wifiEnabled,
    available: pkg.active,
  };
}

let cachedPackages: FinderPackage[] | null = null;

export function getFinderPackages(): FinderPackage[] {
  if (cachedPackages) return cachedPackages;
  cachedPackages = fallbackPackages
    .filter((p) => p.active)
    .map(toFinderPackage);
  return cachedPackages;
}

export function getFinderPackageById(id: string): FinderPackage | undefined {
  return getFinderPackages().find((p) => p.id === id);
}

export function invalidatePackageCache(): void {
  cachedPackages = null;
}
