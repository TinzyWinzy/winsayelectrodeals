export type PipelineStatus =
  | "new"
  | "contacted"
  | "qualified"
  | "assessment_required"
  | "quote_prepared"
  | "quote_sent"
  | "negotiation"
  | "installation_booked"
  | "won"
  | "installed"
  | "lost";

export type LeadTemperature = "hot" | "warm" | "cold";
export type FollowUpPriority = "low" | "normal" | "high" | "urgent";
export type FollowUpType =
  | "whatsapp"
  | "phone_call"
  | "email"
  | "physical_meeting"
  | "site_assessment"
  | "quote_follow_up"
  | "installation_follow_up"
  | "after_sales_follow_up";

export interface LeadRecord {
  id: string;
  customerId: string | null;
  fullName: string;
  phone: string | null;
  whatsappNumber: string | null;
  email: string | null;
  city: string | null;
  suburb: string | null;
  source: string;
  campaign: string | null;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  recommendedPackageId: string | null;
  recommendedPackageName: string | null;
  budget: string | null;
  estimatedContinuousLoad: number;
  estimatedSurgeLoad: number;
  expertReviewRequired: boolean;
  pipelineStatus: PipelineStatus;
  leadScore: number;
  leadTemperature: LeadTemperature;
  installationUrgency: string | null;
  lastContactDate: string | null;
  nextFollowUpDate: string | null;
  lostReason: string | null;
  duplicateOf: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface FollowUpRecord {
  id: string;
  leadId: string | null;
  customerId: string | null;
  followUpType: FollowUpType;
  priority: FollowUpPriority;
  dueAt: string;
  completedAt: string | null;
  outcome: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export const pipelineStatusLabels: Record<PipelineStatus, string> = {
  new: "New",
  contacted: "Contacted",
  qualified: "Qualified",
  assessment_required: "Assessment Required",
  quote_prepared: "Quote Prepared",
  quote_sent: "Quote Sent",
  negotiation: "Negotiation",
  installation_booked: "Installation Booked",
  won: "Won",
  installed: "Installed",
  lost: "Lost",
};

export const followUpTypeLabels: Record<FollowUpType, string> = {
  whatsapp: "WhatsApp",
  phone_call: "Phone Call",
  email: "Email",
  physical_meeting: "Physical Meeting",
  site_assessment: "Site Assessment",
  quote_follow_up: "Quote Follow-Up",
  installation_follow_up: "Installation Follow-Up",
  after_sales_follow_up: "After-Sales Follow-Up",
};
