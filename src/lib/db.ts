/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient as createBrowserClient } from "@supabase/supabase-js";
import type { Package, Customer, Quote, Payment, InstallSchedule, RbzRate } from "@/types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

function toCamelCase(row: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(row)) {
    result[key.replace(/_([a-z])/g, (_, c) => c.toUpperCase())] = value;
  }
  return result;
}

function getSupabaseKey(): string {
  return process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
}

async function getClient() {
  const key = getSupabaseKey();
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !key) {
    return null;
  }
  try {
    if (typeof window === "undefined") {
      return createBrowserClient(supabaseUrl, supabaseKey);
    }
    const { createClient } = await import("@/utils/supabase/client");
    return createClient();
  } catch {
    return null;
  }
}

export async function getPackages(): Promise<Package[]> {
  const supabase = await getClient();
  if (!supabase) {
    const { fallbackPackages } = await import("@/lib/fallback-data");
    return fallbackPackages.filter((p) => p.active);
  }
  const { data, error } = await supabase.from("packages").select("*").eq("active", true).order("sort_order", { ascending: true });
  if (error) throw error;
  return (data || []).map((r) => toCamelCase(r as any)) as any;
}

export async function getPackageById(id: string): Promise<Package | null> {
  if (!id) return null;
  const supabase = await getClient();
  if (!supabase) {
    const { fallbackPackages } = await import("@/lib/fallback-data");
    return fallbackPackages.find((p) => p.id === id) || null;
  }
  try {
    const { data, error } = await supabase.from("packages").select("*").eq("id", id).single();
    if (!error && data) return toCamelCase(data as any) as any;
  } catch {}
  const { fallbackPackages } = await import("@/lib/fallback-data");
  return fallbackPackages.find((p) => p.id === id) || null;
}

export async function getCustomerByPhone(phone: string): Promise<Customer | null> {
  const supabase = await getClient();
  if (!supabase) return null;
  const { data, error } = await supabase.from("customers").select("*").eq("phone", phone).maybeSingle();
  if (error) return null;
  return data ? (toCamelCase(data as any) as any) : null;
}

export async function createCustomer(data: Omit<Customer, "id" | "createdAt">): Promise<string> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) {
    return `local-cust-${Date.now()}`;
  }
  const supabase = await getClient();
  if (!supabase) return `local-cust-${Date.now()}`;
  const { data: result, error } = await supabase.from("customers").insert({
    name: data.name, phone: data.phone, email: data.email,
    province: data.province, city: data.city, suburb: data.suburb,
  }).select("id").single();
  if (error) throw error;
  return result.id;
}

export async function createQuote(data: Omit<Quote, "id" | "createdAt"> & { quoteId: string }): Promise<string> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) {
    const { createLocalQuote } = await import("@/lib/fallback-data");
    return createLocalQuote(data);
  }
  const supabase = await getClient();
  if (!supabase) {
    const { createLocalQuote } = await import("@/lib/fallback-data");
    return createLocalQuote(data);
  }
  const { data: result, error } = await supabase.from("quotes").insert({
    customer_id: data.customerId, package_id: data.packageId, roof_type: data.roofType,
    location: data.location, meter_photo_url: data.meterPhotoUrl, total_usd: data.totalUsd,
    total_zig: data.totalZig, deposit_usd: data.depositUsd, deposit_zig: data.depositZig,
    payment_method: data.paymentMethod, status: data.status, quote_id: data.quoteId,
    pay_after_install: data.payAfterInstall,
  }).select("id").single();
  if (error) throw error;
  return result.id;
}

export async function getQuoteByQuoteId(quoteId: string): Promise<Quote | null> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) {
    const { getLocalQuote } = await import("@/lib/fallback-data");
    return getLocalQuote(quoteId);
  }
  const supabase = await getClient();
  if (!supabase) {
    const { getLocalQuote } = await import("@/lib/fallback-data");
    return getLocalQuote(quoteId);
  }
  const { data, error } = await supabase.from("quotes").select("*").eq("quote_id", quoteId).maybeSingle();
  if (error) return null;
  return data ? (toCamelCase(data as any) as any) : null;
}

export async function updateQuote(id: string, data: Record<string, unknown>): Promise<void> {
  const supabase = await getClient();
  if (!supabase) return;
  const dbData: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data)) {
    dbData[key.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`)] = value;
  }
  const { error } = await supabase.from("quotes").update(dbData).eq("id", id);
  if (error) throw error;
}

export async function getAllQuotes(): Promise<Quote[]> {
  const supabase = await getClient();
  if (!supabase) return [];
  const { data, error } = await supabase.from("quotes").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return (data || []).map((r) => toCamelCase(r as any)) as any;
}

export async function createPayment(data: Omit<Payment, "id" | "createdAt">): Promise<string> {
  const supabase = await getClient();
  if (!supabase) throw new Error("Supabase not configured");
  const { data: result, error } = await supabase.from("payments").insert({
    quote_id: data.quoteId, amount_usd: data.amountUsd, amount_zig: data.amountZig,
    method: data.method, transaction_ref: data.transactionRef, status: data.status,
  }).select("id").single();
  if (error) throw error;
  return result.id;
}

export async function getInstallSchedules(): Promise<InstallSchedule[]> {
  const supabase = await getClient();
  if (!supabase) return [];
  const { data, error } = await supabase.from("install_schedules").select("*").order("install_date", { ascending: true });
  if (error) throw error;
  return (data || []).map((r) => toCamelCase(r as any)) as any;
}

export async function updateInstallSchedule(id: string, data: Record<string, unknown>): Promise<void> {
  const supabase = await getClient();
  if (!supabase) return;
  const dbData: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data)) {
    dbData[key.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`)] = value;
  }
  const { error } = await supabase.from("install_schedules").update(dbData).eq("id", id);
  if (error) throw error;
}

export async function getAllPackagesAdmin(): Promise<Package[]> {
  const supabase = await getClient();
  if (!supabase) return [];
  const { data, error } = await supabase.from("packages").select("*").order("sort_order", { ascending: true });
  if (error) throw error;
  return (data || []).map((r) => toCamelCase(r as any)) as any;
}

export async function updatePackage(id: string, data: Record<string, unknown>): Promise<void> {
  const supabase = await getClient();
  if (!supabase) return;
  const dbData: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data)) {
    dbData[key.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`)] = value;
  }
  const { error } = await supabase.from("packages").update(dbData).eq("id", id);
  if (error) throw error;
}

export function subscribeToQuotes(callback: (quotes: Quote[]) => void): () => void {
  const supabase = createBrowserClient(supabaseUrl, supabaseKey);
  const subscription = supabase
    .channel("quotes-channel")
    .on("postgres_changes" as any, { event: "*", schema: "public", table: "quotes" }, async () => {
      const { data } = await supabase.from("quotes").select("*").order("created_at", { ascending: false });
      if (data) callback(data.map((r) => toCamelCase(r as any)) as any);
    })
    .subscribe();
  return () => subscription.unsubscribe();
}

export async function getRbzRate(): Promise<RbzRate | null> {
  const supabase = await getClient();
  if (!supabase) return null;
  const { data, error } = await supabase.from("rates").select("*").single();
  if (error || !data) return null;
  return { usdToZig: (data as any).usd_to_zig, updatedAt: new Date((data as any).updated_at) };
}

export async function setRbzRate(usdToZig: number): Promise<void> {
  const supabase = await getClient();
  if (!supabase) return;
  const { error } = await supabase.from("rates").upsert({ id: 1, usd_to_zig: usdToZig, updated_at: new Date().toISOString() });
  if (error) throw error;
}

export async function uploadMeterPhoto(file: File | Blob, quoteId: string): Promise<string> {
  const supabase = createBrowserClient(supabaseUrl, supabaseKey);
  const fileName = `meter-photos/${quoteId}/${Date.now()}.jpg`;
  const { data, error } = await supabase.storage.from("files").upload(fileName, file, { contentType: "image/jpeg" });
  if (error) throw error;
  const { data: urlData } = supabase.storage.from("files").getPublicUrl(data.path);
  return urlData.publicUrl;
}

export async function createInstallSchedule(data: Omit<InstallSchedule, "id" | "createdAt">): Promise<string> {
  const supabase = await getClient();
  if (!supabase) throw new Error("Supabase not configured");
  const { data: result, error } = await supabase.from("install_schedules").insert({
    quote_id: data.quoteId,
    install_date: data.installDate,
    installer_name: data.installerName,
    status: data.status,
    notes: data.notes,
  }).select("id").single();
  if (error) throw error;
  return result.id;
}
