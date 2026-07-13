import { createClient } from "@supabase/supabase-js";
import type { SolarFinderLead, LeadStatus } from "@/types/solar-finder";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "";

const STORAGE_KEY = "winsay_solar_finder_leads";

function getLocalLeads(): SolarFinderLead[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveLocalLeads(leads: SolarFinderLead[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(leads));
  } catch {}
}

function generateId(): string {
  return `sf-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export async function submitLead(
  data: Omit<SolarFinderLead, "id" | "timestamp" | "leadSource" | "status">
): Promise<string> {
  const lead: SolarFinderLead = {
    ...data,
    id: generateId(),
    timestamp: new Date().toISOString(),
    leadSource: "Solar System Finder",
    status: "new",
  };

  try {
    if (supabaseUrl && supabaseKey) {
      const supabase = createClient(supabaseUrl, supabaseKey);
      const { error } = await supabase.from("solar_finder_leads").insert({
        id: lead.id,
        timestamp: lead.timestamp,
        full_name: lead.fullName,
        whatsapp_number: lead.whatsappNumber,
        email: lead.email,
        city: lead.city,
        suburb: lead.suburb,
        appliances: JSON.stringify(lead.appliances),
        property_type: lead.propertyType,
        backup_duration: lead.backupDuration,
        usage_pattern: lead.usagePattern,
        budget: lead.budget,
        installation_timeline: lead.installationTimeline,
        recommended_package_id: lead.recommendedPackageId,
        recommended_package_name: lead.recommendedPackageName,
        upgrade_package_id: lead.upgradePackageId,
        upgrade_package_name: lead.upgradePackageName,
        estimated_continuous_load: lead.estimatedContinuousLoad,
        estimated_surge_load: lead.estimatedSurgeLoad,
        expert_review_required: lead.expertReviewRequired,
        lead_source: lead.leadSource,
        status: lead.status,
      });
      if (error) throw error;
    }
  } catch {
    // Fallback to local storage
  }

  const localLeads = getLocalLeads();
  localLeads.unshift(lead);
  saveLocalLeads(localLeads);

  return lead.id;
}

export async function getLeads(): Promise<SolarFinderLead[]> {
  const localLeads = getLocalLeads();

  try {
    if (supabaseUrl && supabaseKey) {
      const supabase = createClient(supabaseUrl, supabaseKey);
      const { data, error } = await supabase
        .from("solar_finder_leads")
        .select("*")
        .order("timestamp", { ascending: false });

      if (!error && data) {
        const supabaseLeads: SolarFinderLead[] = data.map((row: Record<string, unknown>) => ({
          id: String(row.id),
          timestamp: String(row.timestamp),
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
        }));

        const existingLocalIds = new Set(localLeads.map((l) => l.id));
        const newSupabaseLeads = supabaseLeads.filter((l) => !existingLocalIds.has(l.id));
        const combined = [...newSupabaseLeads, ...localLeads];
        saveLocalLeads(combined);
        return combined;
      }
    }
  } catch {
    // Fallback
  }

  return localLeads;
}

function parseAppliances(value: unknown): SolarFinderLead["appliances"] {
  if (typeof value === "string") {
    try {
      return JSON.parse(value);
    } catch {
      return [];
    }
  }
  if (Array.isArray(value)) return value;
  return [];
}

export async function updateLeadStatus(
  id: string,
  status: LeadStatus
): Promise<void> {
  const localLeads = getLocalLeads();
  const index = localLeads.findIndex((l) => l.id === id);
  if (index !== -1) {
    localLeads[index].status = status;
    saveLocalLeads(localLeads);
  }

  try {
    if (supabaseUrl && supabaseKey) {
      const supabase = createClient(supabaseUrl, supabaseKey);
      await supabase.from("solar_finder_leads").update({ status }).eq("id", id);
    }
  } catch {
    // Fallback
  }
}
