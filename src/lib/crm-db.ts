/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient } from "@supabase/supabase-js";
import type { Customer } from "@/types";
import type { CustomerNote, CommunicationLog, CommChannel, CommDirection } from "@/types/crm";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

function getClient() {
  if (!supabaseUrl || !supabaseKey) return null;
  return createClient(supabaseUrl, supabaseKey);
}

function toCamelCase(row: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(row)) {
    result[key.replace(/_([a-z])/g, (_, c) => c.toUpperCase())] = value;
  }
  return result;
}

// ── CUSTOMERS ──

export async function getAllCustomers(): Promise<Customer[]> {
  const client = getClient();
  if (!client) return [];
  const { data } = await client.from("customers").select("*").order("created_at", { ascending: false });
  return (data || []).map((r) => toCamelCase(r as any) as any);
}

export async function getCustomerById(id: string): Promise<Customer | null> {
  const client = getClient();
  if (!client) return null;
  const { data } = await client.from("customers").select("*").eq("id", id).single();
  return data ? (toCamelCase(data as any) as any) : null;
}

// ── CUSTOMER NOTES ──

export async function getCustomerNotes(customerId: string): Promise<CustomerNote[]> {
  const client = getClient();
  if (!client) return [];
  const { data } = await client.from("customer_notes").select("*").eq("customer_id", customerId).order("created_at", { ascending: false });
  return (data || []).map((r: any) => ({
    id: r.id, customerId: r.customer_id, noteType: r.note_type, content: r.content,
    createdBy: r.created_by, createdAt: r.created_at,
  }));
}

export async function createCustomerNote(data: Omit<CustomerNote, "id" | "createdAt">): Promise<string | null> {
  const client = getClient();
  if (!client) return null;
  const { data: result, error } = await client.from("customer_notes").insert({
    customer_id: data.customerId, note_type: data.noteType, content: data.content, created_by: data.createdBy,
  }).select("id").single();
  if (error) throw error;
  return result.id;
}

// ── COMMUNICATION LOGS ──

export async function getCommunicationLogs(customerId: string): Promise<CommunicationLog[]> {
  const client = getClient();
  if (!client) return [];
  const { data } = await client.from("communication_logs").select("*").eq("customer_id", customerId).order("created_at", { ascending: false });
  return (data || []).map((r: any) => ({
    id: r.id, customerId: r.customer_id, channel: r.channel, direction: r.direction,
    subject: r.subject, content: r.content, status: r.status, logMetadata: r.log_metadata || {},
    createdBy: r.created_by, createdAt: r.created_at,
  }));
}

export async function createCommunicationLog(data: {
  customerId: string; channel: CommChannel; direction: CommDirection;
  subject?: string; content?: string; createdBy?: string;
}): Promise<string | null> {
  const client = getClient();
  if (!client) return null;
  const { data: result, error } = await client.from("communication_logs").insert({
    customer_id: data.customerId, channel: data.channel, direction: data.direction,
    subject: data.subject || null, content: data.content || null, created_by: data.createdBy || null,
  }).select("id").single();
  if (error) throw error;
  return result.id;
}
