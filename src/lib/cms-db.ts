/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient } from "@supabase/supabase-js";
import type { CmsHeroSlide, CmsTestimonial, CmsSiteContent, CmsBrand, CmsSiteSetting } from "@/types/cms";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

function getClient() {
  if (!supabaseUrl || !supabaseKey) return null;
  return createClient(supabaseUrl, supabaseKey);
}

function mapRow<T>(row: any, mapping: Record<string, string>): T {
  const result: any = {};
  for (const [key, value] of Object.entries(row)) {
    const mapped = mapping[key] || key;
    result[mapped] = value;
  }
  return result as T;
}

const heroMapping: Record<string, string> = {
  cta_text: "ctaText", cta_link: "ctaLink", image_url: "imageUrl",
  overlay_color: "overlayColor", sort_order: "sortOrder",
  created_at: "createdAt", updated_at: "updatedAt",
};

const testimonialMapping: Record<string, string> = {
  customer_name: "customerName", image_url: "imageUrl",
  sort_order: "sortOrder", created_at: "createdAt", updated_at: "updatedAt",
};

const contentMapping: Record<string, string> = {
  section_key: "sectionKey", cta_text: "ctaText", cta_link: "ctaLink",
  image_url: "imageUrl", created_at: "createdAt", updated_at: "updatedAt",
};

const brandMapping: Record<string, string> = {
  logo_url: "logoUrl", website_url: "websiteUrl",
  sort_order: "sortOrder", created_at: "createdAt", updated_at: "updatedAt",
};

const settingMapping: Record<string, string> = {
  setting_key: "settingKey", setting_value: "settingValue",
  setting_type: "settingType", created_at: "createdAt", updated_at: "updatedAt",
};

// ── HERO SLIDES ──

export async function getHeroSlides(): Promise<CmsHeroSlide[]> {
  const client = getClient();
  if (!client) return [];
  const { data } = await client.from("cms_hero_slides").select("*").order("sort_order");
  return (data || []).map((r) => mapRow<CmsHeroSlide>(r, heroMapping));
}

export async function createHeroSlide(data: Partial<CmsHeroSlide>): Promise<string | null> {
  const client = getClient();
  if (!client) return null;
  const dbData: any = { title: data.title, subtitle: data.subtitle, cta_text: data.ctaText, cta_link: data.ctaLink, image_url: data.imageUrl, overlay_color: data.overlayColor, sort_order: data.sortOrder ?? 0, active: data.active ?? true };
  const { data: result, error } = await client.from("cms_hero_slides").insert(dbData).select("id").single();
  if (error) throw error;
  return result.id;
}

export async function updateHeroSlide(id: string, data: Partial<CmsHeroSlide>): Promise<void> {
  const client = getClient();
  if (!client) return;
  const dbData: any = {};
  if (data.title !== undefined) dbData.title = data.title;
  if (data.subtitle !== undefined) dbData.subtitle = data.subtitle;
  if (data.ctaText !== undefined) dbData.cta_text = data.ctaText;
  if (data.ctaLink !== undefined) dbData.cta_link = data.ctaLink;
  if (data.imageUrl !== undefined) dbData.image_url = data.imageUrl;
  if (data.overlayColor !== undefined) dbData.overlay_color = data.overlayColor;
  if (data.sortOrder !== undefined) dbData.sort_order = data.sortOrder;
  if (data.active !== undefined) dbData.active = data.active;
  await client.from("cms_hero_slides").update(dbData).eq("id", id);
}

export async function deleteHeroSlide(id: string): Promise<void> {
  const client = getClient();
  if (!client) return;
  await client.from("cms_hero_slides").delete().eq("id", id);
}

// ── TESTIMONIALS ──

export async function getTestimonials(): Promise<CmsTestimonial[]> {
  const client = getClient();
  if (!client) return [];
  const { data } = await client.from("cms_testimonials").select("*").order("sort_order");
  return (data || []).map((r) => mapRow<CmsTestimonial>(r, testimonialMapping));
}

export async function createTestimonial(data: Partial<CmsTestimonial>): Promise<string | null> {
  const client = getClient();
  if (!client) return null;
  const dbData: any = { customer_name: data.customerName, location: data.location, content: data.content, rating: data.rating ?? 5, image_url: data.imageUrl, active: data.active ?? true, sort_order: data.sortOrder ?? 0 };
  const { data: result, error } = await client.from("cms_testimonials").insert(dbData).select("id").single();
  if (error) throw error;
  return result.id;
}

export async function updateTestimonial(id: string, data: Partial<CmsTestimonial>): Promise<void> {
  const client = getClient();
  if (!client) return;
  const dbData: any = {};
  if (data.customerName !== undefined) dbData.customer_name = data.customerName;
  if (data.location !== undefined) dbData.location = data.location;
  if (data.content !== undefined) dbData.content = data.content;
  if (data.rating !== undefined) dbData.rating = data.rating;
  if (data.imageUrl !== undefined) dbData.image_url = data.imageUrl;
  if (data.active !== undefined) dbData.active = data.active;
  if (data.sortOrder !== undefined) dbData.sort_order = data.sortOrder;
  await client.from("cms_testimonials").update(dbData).eq("id", id);
}

export async function deleteTestimonial(id: string): Promise<void> {
  const client = getClient();
  if (!client) return;
  await client.from("cms_testimonials").delete().eq("id", id);
}

// ── SITE CONTENT ──

export async function getSiteContent(): Promise<CmsSiteContent[]> {
  const client = getClient();
  if (!client) return [];
  const { data } = await client.from("cms_site_content").select("*").order("section_key");
  return (data || []).map((r) => mapRow<CmsSiteContent>(r, contentMapping));
}

export async function updateSiteContent(id: string, data: Partial<CmsSiteContent>): Promise<void> {
  const client = getClient();
  if (!client) return;
  const dbData: any = {};
  if (data.title !== undefined) dbData.title = data.title;
  if (data.body !== undefined) dbData.body = data.body;
  if (data.ctaText !== undefined) dbData.cta_text = data.ctaText;
  if (data.ctaLink !== undefined) dbData.cta_link = data.ctaLink;
  if (data.imageUrl !== undefined) dbData.image_url = data.imageUrl;
  if (data.metadata !== undefined) dbData.metadata = data.metadata;
  await client.from("cms_site_content").update(dbData).eq("id", id);
}

// ── BRANDS ──

export async function getBrands(): Promise<CmsBrand[]> {
  const client = getClient();
  if (!client) return [];
  const { data } = await client.from("cms_brands").select("*").order("sort_order");
  return (data || []).map((r) => mapRow<CmsBrand>(r, brandMapping));
}

export async function createBrand(data: Partial<CmsBrand>): Promise<string | null> {
  const client = getClient();
  if (!client) return null;
  const dbData: any = { name: data.name, logo_url: data.logoUrl, website_url: data.websiteUrl, description: data.description, sort_order: data.sortOrder ?? 0, active: data.active ?? true };
  const { data: result, error } = await client.from("cms_brands").insert(dbData).select("id").single();
  if (error) throw error;
  return result.id;
}

export async function updateBrand(id: string, data: Partial<CmsBrand>): Promise<void> {
  const client = getClient();
  if (!client) return;
  const dbData: any = {};
  if (data.name !== undefined) dbData.name = data.name;
  if (data.logoUrl !== undefined) dbData.logo_url = data.logoUrl;
  if (data.websiteUrl !== undefined) dbData.website_url = data.websiteUrl;
  if (data.description !== undefined) dbData.description = data.description;
  if (data.sortOrder !== undefined) dbData.sort_order = data.sortOrder;
  if (data.active !== undefined) dbData.active = data.active;
  await client.from("cms_brands").update(dbData).eq("id", id);
}

export async function deleteBrand(id: string): Promise<void> {
  const client = getClient();
  if (!client) return;
  await client.from("cms_brands").delete().eq("id", id);
}

// ── SITE SETTINGS ──

export async function getSiteSettings(): Promise<CmsSiteSetting[]> {
  const client = getClient();
  if (!client) return [];
  const { data } = await client.from("cms_site_settings").select("*").order("setting_key");
  return (data || []).map((r) => mapRow<CmsSiteSetting>(r, settingMapping));
}

export async function updateSiteSetting(id: string, value: string): Promise<void> {
  const client = getClient();
  if (!client) return;
  await client.from("cms_site_settings").update({ setting_value: value }).eq("id", id);
}
