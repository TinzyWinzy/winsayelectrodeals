/**
 * Supabase Database Seed Script
 *
 * Usage:
 *   npx tsx scripts/seed-db.ts
 *
 * Prerequisites:
 *   - Set SUPABASE_URL and SUPABASE_SERVICE_KEY env vars
 *   - Requires service role key for admin access
 */

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("SUPABASE_URL and SUPABASE_SERVICE_KEY required");
  process.exit(1);
}

async function seed() {
  const { createClient } = await import("@supabase/supabase-js");
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  const packages = [
    {
      name: "3.2Kva System",
      kva_rating: 3.2,
      panel_count: 2,
      battery_spec: "25.5V 150Ah lithium battery",
      inverter_brand: "Hybrid Inverter",
      base_price_usd: 950,
      free_gift: "Free Installation",
      tv_bundle_eligible: false,
      pay_after_install_eligible: true,
      active: true,
      sort_order: 1,
      badge: "Entry Level",
      specs: ["2 × 700W solar panels", "25.5V 150Ah lithium battery", "3.2Kva hybrid inverter", "Protection kit", "Mounting kit", "Voltage switch", "Free installation"],
      brands: "SUMRY, Deye",
      wifi_enabled: false,
    },
    {
      name: "3.5Kva System",
      kva_rating: 3.5,
      panel_count: 3,
      battery_spec: "24V 200Ah lithium battery",
      inverter_brand: "Hybrid Inverter",
      base_price_usd: 1000,
      free_gift: "Free Installation",
      tv_bundle_eligible: false,
      pay_after_install_eligible: true,
      active: true,
      sort_order: 2,
      badge: "Popular",
      specs: ["3 × 700W solar panels", "24V 200Ah lithium battery", "3.5Kva hybrid inverter", "Protection kit", "Mounting kit", "Voltage switch", "Free installation"],
      brands: "SUMRY, Deye",
      wifi_enabled: false,
    },
    {
      name: "8.2Kva System",
      kva_rating: 8.2,
      panel_count: 8,
      battery_spec: "48V 200Ah lithium battery",
      inverter_brand: "Hybrid Inverter",
      base_price_usd: 1900,
      free_gift: "Free Installation",
      tv_bundle_eligible: true,
      pay_after_install_eligible: true,
      active: true,
      sort_order: 3,
      badge: "Mid-Range",
      specs: ["8 × 700W solar panels", "48V 200Ah lithium battery", "8.2Kva hybrid inverter", "Protection kit", "Mounting kit", "Voltage switch", "Free installation"],
      brands: "SUMRY, Deye",
      wifi_enabled: false,
    },
    {
      name: "10.2Kva System (Standard)",
      kva_rating: 10.2,
      panel_count: 10,
      battery_spec: "2 × 52.2V Promax battery",
      inverter_brand: "Hybrid Inverter",
      base_price_usd: 3400,
      free_gift: "Free Installation",
      tv_bundle_eligible: true,
      pay_after_install_eligible: false,
      active: true,
      sort_order: 4,
      badge: "High Capacity",
      specs: ["10 × 700W solar panels", "2 × 52.2V Promax battery", "10.2Kva hybrid inverter", "Protection kit", "Mounting kit", "Voltage switch", "Free installation"],
      brands: "SUMRY, Deye, SRNE",
      wifi_enabled: false,
    },
    {
      name: "10.2Kva WiFi System",
      kva_rating: 10.2,
      panel_count: 10,
      battery_spec: "52.2V 200Ah lithium battery",
      inverter_brand: "Hybrid Inverter",
      base_price_usd: 2500,
      free_gift: "Free Installation",
      tv_bundle_eligible: true,
      pay_after_install_eligible: true,
      active: true,
      sort_order: 5,
      badge: "Smart / WiFi",
      specs: ["10 × 700W solar panels", "52.2V 200Ah lithium battery", "10.2Kva hybrid inverter", "WiFi-enabled monitoring", "Protection kit", "Mounting kit", "Voltage switch", "Free installation"],
      brands: "SUMRY, Deye",
      wifi_enabled: true,
    },
    {
      name: "12Kva System",
      kva_rating: 12.0,
      panel_count: 12,
      battery_spec: "2 × 48V 200Ah battery",
      inverter_brand: "Hybrid Inverter",
      base_price_usd: 3400,
      free_gift: "Free Installation",
      tv_bundle_eligible: true,
      pay_after_install_eligible: false,
      active: true,
      sort_order: 6,
      badge: "Maximum Power",
      specs: ["12 × 700W solar panels", "2 × 48V 200Ah battery", "12Kva hybrid inverter", "Protection kit", "Mounting kit", "Voltage switch", "Free installation"],
      brands: "SUMRY, Deye, SRNE",
      wifi_enabled: false,
    },
  ];

  const { error: deleteError } = await supabase.from("packages").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  if (deleteError) console.warn("Cleanup note:", deleteError.message);

  for (const pkg of packages) {
    const { error } = await supabase.from("packages").insert(pkg);
    if (error) {
      console.error(`Failed to insert ${pkg.name}:`, error.message);
    } else {
      console.log(`✓ Inserted: ${pkg.name}`);
    }
  }

  const { error: rateError } = await supabase
    .from("rates")
    .upsert({ id: 1, usd_to_zig: 400, updated_at: new Date().toISOString() });

  if (rateError) {
    console.error("Failed to set rate:", rateError.message);
  } else {
    console.log("✓ Seeded RBZ rate (1 USD = 400 ZIG)");
  }

  console.log("Seed complete!");
}

seed().catch(console.error);
