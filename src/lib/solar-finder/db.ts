import { createClient } from "@supabase/supabase-js";
import type { SolarFinderLead, LeadStatus } from "@/types/solar-finder";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const serviceKey = process.env.SUPABASE_SERVICE_KEY || "";

function getServiceClient() {
  if (!supabaseUrl || !serviceKey) return null;
  return createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

function generateId(): string {
  return `sf-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function normalizePhone(value: string): string {
  const digits = value.replace(/\D/g, "");
  if (digits.startsWith("263")) return `+${digits}`;
  if (digits.startsWith("0")) return `+263${digits.slice(1)}`;
  return value.trim();
}

export function calculateLeadScore(data: SubmitSolarFinderLeadData): { score: number; temperature: "hot" | "warm" | "cold" } {
  let score = 20;
  if (data.whatsappNumber) score += 15;
  if (data.email) score += 5;
  if (data.city) score += 5;
  if (data.budget && data.budget !== "expert-advice") score += 15;
  if (data.installationTimeline === "immediately") score += 25;
  if (data.installationTimeline === "within-7-days") score += 20;
  if (data.installationTimeline === "within-30-days") score += 10;
  if (data.expertReviewRequired) score += 5;
  if (data.budget === "under-1000" && data.estimatedContinuousLoad > 2500) score -= 15;

  const bounded = Math.max(0, Math.min(100, score));
  if (bounded >= 70) return { score: bounded, temperature: "hot" };
  if (bounded >= 40) return { score: bounded, temperature: "warm" };
  return { score: bounded, temperature: "cold" };
}

export type SubmitSolarFinderLeadData = Omit<
  SolarFinderLead,
  "id" | "timestamp" | "leadSource" | "status"
> & {
  utmSource?: string | null;
  utmMedium?: string | null;
  utmCampaign?: string | null;
  utmContent?: string | null;
  referrer?: string | null;
  landingPage?: string | null;
};

function mapRow(row: Record<string, unknown>): SolarFinderLead {
  return {
    id: String(row.id),
    timestamp: String(row.timestamp || row.created_at || ""),
    fullName: String(row.full_name || ""),
    whatsappNumber: String(row.whatsapp_number || ""),
    email: String(row.email || ""),
    city: String(row.city || ""),
    suburb: String(row.suburb || ""),
    appliances: parseAppliances(row.appliances),
    propertyType: (row.property_type as SolarFinderLead["propertyType"]) || null,
    backupDuration: (row.backup_duration as SolarFinderLead["backupDuration"]) || null,
    usagePattern: (row.usage_pattern as SolarFinderLead["usagePattern"]) || null,
    budget: (row.budget as SolarFinderLead["budget"]) || null,
    installationTimeline: (row.installation_timeline as SolarFinderLead["installationTimeline"]) || "researching",
    recommendedPackageId: String(row.recommended_package_id || ""),
    recommendedPackageName: String(row.recommended_package_name || ""),
    upgradePackageId: row.upgrade_package_id ? String(row.upgrade_package_id) : null,
    upgradePackageName: row.upgrade_package_name ? String(row.upgrade_package_name) : null,
    estimatedContinuousLoad: Number(row.estimated_continuous_load || 0),
    estimatedSurgeLoad: Number(row.estimated_surge_load || 0),
    expertReviewRequired: Boolean(row.expert_review_required),
    leadSource: String(row.lead_source || "Solar System Finder"),
    status: (row.status as LeadStatus) || "new",
  };
}

function parseAppliances(value: unknown): SolarFinderLead["appliances"] {
  if (Array.isArray(value)) return value as SolarFinderLead["appliances"];
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}

export async function submitLead(data: SubmitSolarFinderLeadData): Promise<string> {
  if (typeof window !== "undefined") {
    const response = await fetch("/api/solar-finder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Failed to submit lead");
    return result.id;
  }

  const supabase = getServiceClient();
  if (!supabase) {
    throw new Error("Supabase service key is required for server-side lead persistence");
  }

  const id = generateId();
  const timestamp = new Date().toISOString();
  const normalizedWhatsapp = normalizePhone(data.whatsappNumber);
  const leadScore = calculateLeadScore(data);

  const { data: existingCustomer } = await supabase
    .from("customers")
    .select("id")
    .eq("phone", normalizedWhatsapp)
    .maybeSingle();

  let customerId = existingCustomer?.id as string | undefined;
  if (!customerId) {
    const { data: customer, error: customerError } = await supabase
      .from("customers")
      .insert({
        name: data.fullName,
        phone: normalizedWhatsapp,
        email: data.email || null,
        city: data.city || null,
        suburb: data.suburb || null,
      })
      .select("id")
      .single();

    if (customerError) throw customerError;
    customerId = customer.id;
  }

  const { data: duplicateLead } = await supabase
    .from("leads")
    .select("id")
    .eq("whatsapp_number", normalizedWhatsapp)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data: lead, error: leadError } = await supabase
    .from("leads")
    .insert({
      customer_id: customerId,
      full_name: data.fullName,
      phone: normalizedWhatsapp,
      whatsapp_number: normalizedWhatsapp,
      email: data.email || null,
      city: data.city || null,
      suburb: data.suburb || null,
      source: "solar_finder",
      referrer: data.referrer || null,
      utm_source: data.utmSource || null,
      utm_medium: data.utmMedium || null,
      utm_campaign: data.utmCampaign || null,
      utm_content: data.utmContent || null,
      landing_page: data.landingPage || null,
      selected_appliances: data.appliances,
      property_type: data.propertyType,
      backup_duration: data.backupDuration,
      usage_pattern: data.usagePattern,
      budget: data.budget,
      recommended_package_id: data.recommendedPackageId,
      recommended_package_name: data.recommendedPackageName,
      alternative_package_id: data.upgradePackageId,
      alternative_package_name: data.upgradePackageName,
      estimated_continuous_load: data.estimatedContinuousLoad,
      estimated_surge_load: data.estimatedSurgeLoad,
      expert_review_required: data.expertReviewRequired,
      pipeline_status: "new",
      lead_score: leadScore.score,
      lead_temperature: leadScore.temperature,
      installation_urgency: data.installationTimeline,
      duplicate_of: duplicateLead?.id || null,
    })
    .select("id")
    .single();

  if (leadError) throw leadError;

  const { error: finderError } = await supabase.from("solar_finder_leads").insert({
    id,
    lead_id: lead.id,
    timestamp,
    full_name: data.fullName,
    whatsapp_number: normalizedWhatsapp,
    email: data.email || null,
    city: data.city || null,
    suburb: data.suburb || null,
    appliances: data.appliances,
    property_type: data.propertyType,
    backup_duration: data.backupDuration,
    usage_pattern: data.usagePattern,
    budget: data.budget,
    installation_timeline: data.installationTimeline,
    recommended_package_id: data.recommendedPackageId,
    recommended_package_name: data.recommendedPackageName,
    upgrade_package_id: data.upgradePackageId,
    upgrade_package_name: data.upgradePackageName,
    estimated_continuous_load: data.estimatedContinuousLoad,
    estimated_surge_load: data.estimatedSurgeLoad,
    expert_review_required: data.expertReviewRequired,
    lead_source: "Solar System Finder",
    status: "new",
    utm_source: data.utmSource || null,
    utm_medium: data.utmMedium || null,
    utm_campaign: data.utmCampaign || null,
    utm_content: data.utmContent || null,
    referrer: data.referrer || null,
    landing_page: data.landingPage || null,
  });

  if (finderError) throw finderError;
  return id;
}

export async function getLeads(): Promise<SolarFinderLead[]> {
  if (typeof window !== "undefined") {
    const response = await fetch("/api/solar-finder");
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Failed to fetch leads");
    return result.leads;
  }

  const supabase = getServiceClient();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("solar_finder_leads")
    .select("*")
    .order("timestamp", { ascending: false });
  if (error) throw error;
  return (data || []).map((row) => mapRow(row));
}

export async function updateLeadStatus(id: string, status: LeadStatus): Promise<void> {
  if (typeof window !== "undefined") {
    const response = await fetch("/api/solar-finder", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Failed to update lead");
    return;
  }

  const supabase = getServiceClient();
  if (!supabase) throw new Error("Supabase service key is required");
  const { error } = await supabase.from("solar_finder_leads").update({ status }).eq("id", id);
  if (error) throw error;
}
