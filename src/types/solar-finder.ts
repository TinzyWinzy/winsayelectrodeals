export interface SolarAppliance {
  id: string;
  name: string;
  category: ApplianceCategory;
  estimatedWatts: number;
  surgeMultiplier: number;
  defaultQuantity: number;
  allowQuantity: boolean;
  icon: string;
}

export type ApplianceCategory =
  | "lighting"
  | "entertainment"
  | "communication"
  | "kitchen"
  | "cooling"
  | "work"
  | "water"
  | "security"
  | "business"
  | "other";

export type PropertyType =
  | "1-2-room"
  | "3-4-room"
  | "5-plus-room"
  | "large-family-home"
  | "apartment"
  | "farm"
  | "shop"
  | "office"
  | "school"
  | "lodge-guest-house"
  | "other-business";

export type BackupDuration =
  | "2-4-hours"
  | "4-8-hours"
  | "8-12-hours"
  | "overnight"
  | "full-day"
  | "not-sure";

export type UsagePattern =
  | "during-loadshedding"
  | "every-night"
  | "day-and-night"
  | "business-continuity"
  | "off-grid"
  | "not-sure";

export type BudgetRange =
  | "under-1000"
  | "1000-1500"
  | "1500-2500"
  | "2500-3500"
  | "above-3500"
  | "flexible"
  | "expert-advice";

export type ContactMethod = "whatsapp" | "phone-call" | "email";

export type InstallationTimeline =
  | "immediately"
  | "within-7-days"
  | "within-30-days"
  | "researching";

export type LeadStatus =
  | "new"
  | "contacted"
  | "qualified"
  | "quoted"
  | "installation-booked"
  | "won"
  | "lost";

export interface ApplianceSelection {
  applianceId: string;
  quantity: number;
}

export interface SolarFinderFormData {
  appliances: ApplianceSelection[];
  propertyType: PropertyType | null;
  city: string;
  suburb: string;
  backupDuration: BackupDuration | null;
  usagePattern: UsagePattern | null;
  budget: BudgetRange | null;
  fullName: string;
  whatsappNumber: string;
  email: string;
  contactMethod: ContactMethod;
  installationTimeline: InstallationTimeline;
}

export interface RecommendationResult {
  primaryPackageId: string;
  primaryPackageName: string;
  primaryPackagePrice: number;
  primaryPackageSpecs: string[];
  primaryPackageImage: string;
  upgradePackageId: string | null;
  upgradePackageName: string | null;
  upgradePackagePrice: number | null;
  upgradePackageSpecs: string[] | null;
  upgradePackageImage: string | null;
  estimatedContinuousLoad: number;
  estimatedSurgeLoad: number;
  budgetMismatch: boolean;
  expertReviewRequired: boolean;
  reason: string;
  disclaimer: string;
}

export interface SolarFinderLead {
  id: string;
  timestamp: string;
  fullName: string;
  whatsappNumber: string;
  email: string;
  city: string;
  suburb: string;
  appliances: ApplianceSelection[];
  propertyType: PropertyType | null;
  backupDuration: BackupDuration | null;
  usagePattern: UsagePattern | null;
  budget: BudgetRange | null;
  installationTimeline: InstallationTimeline;
  recommendedPackageId: string;
  recommendedPackageName: string;
  upgradePackageId: string | null;
  upgradePackageName: string | null;
  estimatedContinuousLoad: number;
  estimatedSurgeLoad: number;
  expertReviewRequired: boolean;
  leadSource: string;
  status: LeadStatus;
}

export interface AnalyticsEvent {
  name: string;
  timestamp: string;
  data?: Record<string, unknown>;
}

export const propertyTypeLabels: Record<PropertyType, string> = {
  "1-2-room": "1–2 Room Home",
  "3-4-room": "3–4 Room Home",
  "5-plus-room": "5+ Room Home",
  "large-family-home": "Large Family Home",
  apartment: "Apartment",
  farm: "Farm",
  shop: "Shop",
  office: "Office",
  school: "School",
  "lodge-guest-house": "Lodge / Guest House",
  "other-business": "Other Business",
};

export const backupDurationLabels: Record<BackupDuration, string> = {
  "2-4-hours": "2–4 hours",
  "4-8-hours": "4–8 hours",
  "8-12-hours": "8–12 hours",
  overnight: "Overnight",
  "full-day": "Full day",
  "not-sure": "Not sure",
};

export const usagePatternLabels: Record<UsagePattern, string> = {
  "during-loadshedding": "During power cuts",
  "every-night": "Every night",
  "day-and-night": "Day and night",
  "business-continuity": "For business continuity",
  "off-grid": "For an off-grid property",
  "not-sure": "Not sure",
};

export const budgetLabels: Record<BudgetRange, string> = {
  "under-1000": "Under $1,000",
  "1000-1500": "$1,000–$1,500",
  "1500-2500": "$1,500–$2,500",
  "2500-3500": "$2,500–$3,500",
  "above-3500": "Above $3,500",
  flexible: "I'm flexible",
  "expert-advice": "I need expert advice",
};

export const timelineLabels: Record<InstallationTimeline, string> = {
  immediately: "Immediately",
  "within-7-days": "Within 7 days",
  "within-30-days": "Within 30 days",
  researching: "Researching options",
};

export const contactMethodLabels: Record<ContactMethod, string> = {
  whatsapp: "WhatsApp",
  "phone-call": "Phone call",
  email: "Email",
};

export const leadStatusLabels: Record<LeadStatus, string> = {
  new: "New",
  contacted: "Contacted",
  qualified: "Qualified",
  quoted: "Quoted",
  "installation-booked": "Installation Booked",
  won: "Won",
  lost: "Lost",
};
