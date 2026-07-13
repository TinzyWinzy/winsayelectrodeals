/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient } from "@supabase/supabase-js";
import type { FollowUpRecord, FollowUpType, LeadRecord, PipelineStatus } from "@/types/leads";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const serviceKey = process.env.SUPABASE_SERVICE_KEY || "";

function getClient() {
  if (!supabaseUrl || !serviceKey) return null;
  return createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

function mapLead(row: any): LeadRecord {
  return {
    id: row.id,
    customerId: row.customer_id,
    fullName: row.full_name,
    phone: row.phone,
    whatsappNumber: row.whatsapp_number,
    email: row.email,
    city: row.city,
    suburb: row.suburb,
    source: row.source,
    campaign: row.campaign,
    utmSource: row.utm_source,
    utmMedium: row.utm_medium,
    utmCampaign: row.utm_campaign,
    recommendedPackageId: row.recommended_package_id,
    recommendedPackageName: row.recommended_package_name,
    budget: row.budget,
    estimatedContinuousLoad: row.estimated_continuous_load || 0,
    estimatedSurgeLoad: row.estimated_surge_load || 0,
    expertReviewRequired: Boolean(row.expert_review_required),
    pipelineStatus: row.pipeline_status,
    leadScore: row.lead_score || 0,
    leadTemperature: row.lead_temperature || "cold",
    installationUrgency: row.installation_urgency,
    lastContactDate: row.last_contact_date,
    nextFollowUpDate: row.next_follow_up_date,
    lostReason: row.lost_reason,
    duplicateOf: row.duplicate_of,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapFollowUp(row: any): FollowUpRecord {
  return {
    id: row.id,
    leadId: row.lead_id,
    customerId: row.customer_id,
    followUpType: row.follow_up_type,
    priority: row.priority || "normal",
    dueAt: row.due_at,
    completedAt: row.completed_at,
    outcome: row.outcome,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getLeadsPipeline(): Promise<LeadRecord[]> {
  const client = getClient();
  if (!client) return [];
  const { data, error } = await client.from("leads").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return (data || []).map(mapLead);
}

export async function updateLeadPipelineStatus(id: string, status: PipelineStatus): Promise<void> {
  const client = getClient();
  if (!client) throw new Error("Supabase service key is required");
  const { error } = await client
    .from("leads")
    .update({
      pipeline_status: status,
      last_contact_date: status === "contacted" ? new Date().toISOString() : undefined,
    })
    .eq("id", id);
  if (error) throw error;
}

export async function getFollowUps(): Promise<FollowUpRecord[]> {
  const client = getClient();
  if (!client) return [];
  const { data, error } = await client
    .from("follow_ups")
    .select("*")
    .is("completed_at", null)
    .order("due_at", { ascending: true });
  if (error) throw error;
  return (data || []).map(mapFollowUp);
}

export async function createFollowUp(data: {
  leadId: string;
  customerId?: string | null;
  followUpType: FollowUpType;
  dueAt: string;
  priority?: string;
  notes?: string;
}): Promise<string> {
  const client = getClient();
  if (!client) throw new Error("Supabase service key is required");
  const { data: result, error } = await client
    .from("follow_ups")
    .insert({
      lead_id: data.leadId,
      customer_id: data.customerId || null,
      follow_up_type: data.followUpType,
      due_at: data.dueAt,
      priority: data.priority || "normal",
      notes: data.notes || null,
    })
    .select("id")
    .single();
  if (error) throw error;

  await client.from("leads").update({ next_follow_up_date: data.dueAt }).eq("id", data.leadId);
  return result.id;
}

export async function completeFollowUp(id: string, outcome: string): Promise<void> {
  const client = getClient();
  if (!client) throw new Error("Supabase service key is required");
  const { error } = await client
    .from("follow_ups")
    .update({ completed_at: new Date().toISOString(), outcome })
    .eq("id", id);
  if (error) throw error;
}
