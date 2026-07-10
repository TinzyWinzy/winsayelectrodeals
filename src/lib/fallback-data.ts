import type { Package, Quote } from "@/types";

export const kvaToImage: Record<string, string> = {
  "3.2": "/3kvasystem.jpg",
  "3.5": "/3kvasystem.jpg",
  "8.2": "/8kva10.2kvasystem.jpg",
  "10.2": "/102kva12kvasystem.jpg",
  "12.0": "/102kva12kvasystem.jpg",
};

export function getPackageImage(kvaRating: number): string {
  const key = String(kvaRating);
  return kvaToImage[key] || "/8kva10.2kvasystem.jpg";
}

export const fallbackPackages: Package[] = [
  {
    id: "pkg-3.2",
    name: "3.2Kva System",
    kvaRating: 3.2,
    panelCount: 2,
    batterySpec: "25.5V 150Ah lithium battery",
    inverterBrand: "Hybrid Inverter",
    basePriceUsd: 950,
    zigPrice: null,
    freeGift: "Free Installation",
    tvBundleEligible: false,
    payAfterInstallEligible: true,
    active: true,
    sortOrder: 1,
    createdAt: new Date(),
    badge: "Entry Level",
    brands: "SUMRY, Deye",
    specs: [
      "2 × 700W solar panels",
      "25.5V 150Ah lithium battery",
      "3.2Kva hybrid inverter",
      "Protection kit",
      "Mounting kit",
      "Voltage switch",
      "Free installation",
    ],
  },
  {
    id: "pkg-3.5",
    name: "3.5Kva System",
    kvaRating: 3.5,
    panelCount: 3,
    batterySpec: "24V 200Ah lithium battery",
    inverterBrand: "Hybrid Inverter",
    basePriceUsd: 1000,
    zigPrice: null,
    freeGift: "Free Installation",
    tvBundleEligible: false,
    payAfterInstallEligible: true,
    active: true,
    sortOrder: 2,
    createdAt: new Date(),
    badge: "Popular",
    brands: "SUMRY, Deye",
    specs: [
      "3 × 700W solar panels",
      "24V 200Ah lithium battery",
      "3.5Kva hybrid inverter",
      "Protection kit",
      "Mounting kit",
      "Voltage switch",
      "Free installation",
    ],
  },
  {
    id: "pkg-8.2",
    name: "8.2Kva System",
    kvaRating: 8.2,
    panelCount: 8,
    batterySpec: "48V 200Ah lithium battery",
    inverterBrand: "Hybrid Inverter",
    basePriceUsd: 1900,
    zigPrice: null,
    freeGift: "Free Installation",
    tvBundleEligible: true,
    payAfterInstallEligible: true,
    active: true,
    sortOrder: 3,
    createdAt: new Date(),
    badge: "Mid-Range",
    brands: "SUMRY, Deye",
    specs: [
      "8 × 700W solar panels",
      "48V 200Ah lithium battery",
      "8.2Kva hybrid inverter",
      "Protection kit",
      "Mounting kit",
      "Voltage switch",
      "Free installation",
    ],
  },
  {
    id: "pkg-10.2-standard",
    name: "10.2Kva System (Standard)",
    kvaRating: 10.2,
    panelCount: 10,
    batterySpec: "2 × 52.2V Promax battery",
    inverterBrand: "Hybrid Inverter",
    basePriceUsd: 3400,
    zigPrice: null,
    freeGift: "Free Installation",
    tvBundleEligible: true,
    payAfterInstallEligible: false,
    active: true,
    sortOrder: 4,
    createdAt: new Date(),
    badge: "High Capacity",
    brands: "SUMRY, Deye, SRNE",
    specs: [
      "10 × 700W solar panels",
      "2 × 52.2V Promax battery",
      "10.2Kva hybrid inverter",
      "Protection kit",
      "Mounting kit",
      "Voltage switch",
      "Free installation",
    ],
  },
  {
    id: "pkg-10.2-wifi",
    name: "10.2Kva WiFi System",
    kvaRating: 10.2,
    panelCount: 10,
    batterySpec: "52.2V 200Ah lithium battery",
    inverterBrand: "Hybrid Inverter",
    basePriceUsd: 2500,
    zigPrice: null,
    freeGift: "Free Installation",
    tvBundleEligible: true,
    payAfterInstallEligible: true,
    active: true,
    sortOrder: 5,
    createdAt: new Date(),
    badge: "Smart / WiFi",
    brands: "SUMRY, Deye",
    wifiEnabled: true,
    specs: [
      "10 × 700W solar panels",
      "52.2V 200Ah lithium battery",
      "10.2Kva hybrid inverter",
      "WiFi-enabled monitoring",
      "Protection kit",
      "Mounting kit",
      "Voltage switch",
      "Free installation",
    ],
  },
  {
    id: "pkg-12",
    name: "12Kva System",
    kvaRating: 12.0,
    panelCount: 12,
    batterySpec: "2 × 48V 200Ah battery",
    inverterBrand: "Hybrid Inverter",
    basePriceUsd: 3400,
    zigPrice: null,
    freeGift: "Free Installation",
    tvBundleEligible: true,
    payAfterInstallEligible: false,
    active: true,
    sortOrder: 6,
    createdAt: new Date(),
    badge: "Maximum Power",
    brands: "SUMRY, Deye, SRNE",
    specs: [
      "12 × 700W solar panels",
      "2 × 48V 200Ah battery",
      "12Kva hybrid inverter",
      "Protection kit",
      "Mounting kit",
      "Voltage switch",
      "Free installation",
    ],
  },
];

const QUOTES_STORAGE_KEY = "winsay_local_quotes";

function getLocalQuotes(): Record<string, Quote> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(QUOTES_STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
}

function saveLocalQuotes(quotes: Record<string, Quote>): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(QUOTES_STORAGE_KEY, JSON.stringify(quotes));
  } catch {}
}

export function createLocalQuote(
  data: Omit<Quote, "id" | "createdAt"> & { quoteId: string }
): string {
  const docId = `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const quotes = getLocalQuotes();
  quotes[data.quoteId] = {
    id: docId,
    customerId: data.customerId,
    packageId: data.packageId,
    roofType: data.roofType,
    location: data.location,
    meterPhotoUrl: data.meterPhotoUrl,
    totalUsd: data.totalUsd,
    totalZig: data.totalZig,
    depositUsd: data.depositUsd,
    depositZig: data.depositZig,
    paymentMethod: data.paymentMethod,
    status: data.status,
    quoteId: data.quoteId,
    payAfterInstall: data.payAfterInstall,
    createdAt: new Date(),
  };
  saveLocalQuotes(quotes);
  return docId;
}

export function getLocalQuote(quoteId: string): Quote | null {
  const quotes = getLocalQuotes();
  return quotes[quoteId] || null;
}
