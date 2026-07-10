import { z } from "zod";

export type RoofType = "tile" | "corrugated" | "flat" | "ground";

export type PaymentMethod = "ecocash" | "innbucks" | "bank_transfer" | "paynow";

export type QuoteStatus = "pending" | "deposit_paid" | "fully_paid" | "installed" | "cancelled";

export type InstallStatus = "scheduled" | "in_progress" | "completed" | "cancelled";

export interface Package {
  id: string;
  name: string;
  kvaRating: number;
  panelCount: number;
  batterySpec: string;
  inverterBrand: string;
  basePriceUsd: number;
  zigPrice: number | null;
  freeGift: string | null;
  tvBundleEligible: boolean;
  payAfterInstallEligible: boolean;
  active: boolean;
  sortOrder: number;
  createdAt: Date;
  badge?: string;
  specs?: string[];
  brands?: string;
  wifiEnabled?: boolean;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  province: string | null;
  city: string | null;
  suburb: string | null;
  createdAt: Date;
}

export interface Quote {
  id: string;
  customerId: string;
  packageId: string;
  roofType: RoofType | null;
  location: string | null;
  meterPhotoUrl: string | null;
  totalUsd: number;
  totalZig: number | null;
  depositUsd: number;
  depositZig: number | null;
  paymentMethod: PaymentMethod | null;
  status: QuoteStatus;
  quoteId: string;
  payAfterInstall: boolean;
  createdAt: Date;
}

export interface Payment {
  id: string;
  quoteId: string;
  amountUsd: number;
  amountZig: number | null;
  method: string;
  transactionRef: string | null;
  status: string;
  createdAt: Date;
}

export interface InstallSchedule {
  id: string;
  quoteId: string;
  installDate: string | null;
  installerName: string | null;
  status: InstallStatus;
  notes: string | null;
  createdAt: Date;
}

export interface RbzRate {
  usdToZig: number;
  updatedAt: Date;
}

export const roofTypeLabels: Record<RoofType, string> = {
  tile: "Tile Roof",
  corrugated: "Corrugated Iron",
  flat: "Flat Roof",
  ground: "Ground Mount",
};

export const roofTypeSurcharges: Record<RoofType, number> = {
  tile: 0,
  corrugated: 50,
  flat: 100,
  ground: 200,
};

export const provinceSurcharges: Record<string, number> = {
  Harare: 0,
  Bulawayo: 50,
  "Mashonaland West": 30,
  "Mashonaland East": 30,
  "Mashonaland Central": 40,
  "Matabeleland North": 80,
  "Matabeleland South": 100,
  Midlands: 50,
  Masvingo: 70,
  Manicaland: 60,
};

export const provinces = [
  "Harare",
  "Bulawayo",
  "Mashonaland West",
  "Mashonaland East",
  "Mashonaland Central",
  "Matabeleland North",
  "Matabeleland South",
  "Midlands",
  "Masvingo",
  "Manicaland",
];

export const citiesByProvince: Record<string, string[]> = {
  Harare: ["Harare", "Chitungwiza", "Epworth", "Norton"],
  Bulawayo: ["Bulawayo"],
  "Mashonaland West": ["Chinhoyi", "Karoi", "Norton"],
  "Mashonaland East": ["Marondera", "Ruwa", "Murehwa"],
  "Mashonaland Central": ["Bindura", "Mount Darwin", "Shamva"],
  "Matabeleland North": ["Victoria Falls", "Hwange", "Lupane"],
  "Matabeleland South": ["Gwanda", "Beitbridge", "Plumtree"],
  Midlands: ["Gweru", "Kwekwe", "Zvishavane", "Redcliff"],
  Masvingo: ["Masvingo", "Chiredzi", "Triangle"],
  Manicaland: ["Mutare", "Rusape", "Chipinge"],
};

export const packageSchema = z.object({
  name: z.string().min(1, "Name is required"),
  kvaRating: z.number().positive("kVA rating must be positive"),
  panelCount: z.number().int().positive("Panel count must be positive"),
  batterySpec: z.string().min(1, "Battery spec is required"),
  inverterBrand: z.string().min(1, "Inverter brand is required"),
  basePriceUsd: z.number().positive("Base price must be positive"),
  zigPrice: z.number().nullable(),
  freeGift: z.string().nullable(),
  tvBundleEligible: z.boolean(),
  payAfterInstallEligible: z.boolean(),
  active: z.boolean(),
  sortOrder: z.number().int().default(0),
});

export const quoteSubmissionSchema = z.object({
  customerName: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().regex(/^(\+263|0)\d{9}$/, "Valid Zimbabwe phone number required"),
  email: z.string().email("Valid email required").nullable(),
  packageId: z.string().min(1, "Package selection required"),
  roofType: z.enum(["tile", "corrugated", "flat", "ground"]),
  province: z.string().min(1, "Province required"),
  city: z.string().min(1, "City required"),
  suburb: z.string().min(1, "Suburb required"),
  meterPhotoUrl: z.string().nullable(),
  payAfterInstall: z.boolean(),
  paymentMethod: z.enum(["ecocash", "innbucks", "bank_transfer", "paynow"]),
});
