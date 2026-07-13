/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient } from "@supabase/supabase-js";
import type { Product, InventoryStock, StockMovement, PurchaseOrder, PurchaseOrderItem, MovementType } from "@/types/inventory";

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

// ── PRODUCTS ──

export async function getProducts(): Promise<Product[]> {
  const client = getClient();
  if (!client) return [];
  const { data } = await client.from("products").select("*").order("name");
  return (data || []).map((r) => toCamelCase(r as any) as any);
}

export async function getProductById(id: string): Promise<Product | null> {
  const client = getClient();
  if (!client) return null;
  const { data } = await client.from("products").select("*").eq("id", id).single();
  return data ? (toCamelCase(data as any) as any) : null;
}

export async function createProduct(data: Partial<Product>): Promise<string | null> {
  const client = getClient();
  if (!client) return null;
  const dbData: any = {
    name: data.name, sku: data.sku, category: data.category, brand: data.brand,
    model: data.model, description: data.description, specifications: data.specifications || {},
    unit: data.unit || "piece", unit_price_usd: data.unitPriceUsd, unit_price_zig: data.unitPriceZig,
    supplier: data.supplier, min_stock_level: data.minStockLevel ?? 0, active: data.active ?? true,
    image_url: data.imageUrl,
  };
  const { data: result, error } = await client.from("products").insert(dbData).select("id").single();
  if (error) throw error;
  return result.id;
}

export async function updateProduct(id: string, data: Partial<Product>): Promise<void> {
  const client = getClient();
  if (!client) return;
  const dbData: Record<string, unknown> = {};
  if (data.name !== undefined) dbData.name = data.name;
  if (data.sku !== undefined) dbData.sku = data.sku;
  if (data.category !== undefined) dbData.category = data.category;
  if (data.brand !== undefined) dbData.brand = data.brand;
  if (data.model !== undefined) dbData.model = data.model;
  if (data.description !== undefined) dbData.description = data.description;
  if (data.specifications !== undefined) dbData.specifications = data.specifications;
  if (data.unit !== undefined) dbData.unit = data.unit;
  if (data.unitPriceUsd !== undefined) dbData.unit_price_usd = data.unitPriceUsd;
  if (data.unitPriceZig !== undefined) dbData.unit_price_zig = data.unitPriceZig;
  if (data.supplier !== undefined) dbData.supplier = data.supplier;
  if (data.minStockLevel !== undefined) dbData.min_stock_level = data.minStockLevel;
  if (data.active !== undefined) dbData.active = data.active;
  if (data.imageUrl !== undefined) dbData.image_url = data.imageUrl;
  await client.from("products").update(dbData).eq("id", id);
}

// ── INVENTORY STOCK ──

export async function getInventoryStock(): Promise<(InventoryStock & { productName?: string; sku?: string })[]> {
  const client = getClient();
  if (!client) return [];
  const { data } = await client.from("inventory_stock").select("*, products(name, sku)").order("product_id");
  return (data || []).map((r: any) => ({
    id: r.id, productId: r.product_id, location: r.location, quantity: r.quantity,
    reservedQuantity: r.reserved_quantity, updatedAt: r.updated_at,
    productName: r.products?.name, sku: r.products?.sku,
  }));
}

// ── STOCK MOVEMENTS ──

export async function getStockMovements(productId?: string): Promise<StockMovement[]> {
  const client = getClient();
  if (!client) return [];
  let query = client.from("stock_movements").select("*, products!inner(name, sku)").order("created_at", { ascending: false });
  if (productId) query = query.eq("product_id", productId);
  const { data } = await query;
  return (data || []).map((r: any) => ({
    id: r.id, productId: r.product_id, movementType: r.movement_type, quantity: r.quantity,
    referenceType: r.reference_type, referenceId: r.reference_id, notes: r.notes,
    unitPriceUsd: r.unit_price_usd, batchNumber: r.batch_number, createdBy: r.created_by, createdAt: r.created_at,
    productName: r.products?.name, productSku: r.products?.sku,
  })) as any;
}

export async function createStockMovement(data: {
  productId: string; movementType: MovementType; quantity: number;
  notes?: string; unitPriceUsd?: number; batchNumber?: string; createdBy?: string;
}): Promise<string | null> {
  const client = getClient();
  if (!client) return null;
  const { data: result, error } = await client.from("stock_movements").insert({
    product_id: data.productId, movement_type: data.movementType, quantity: data.quantity,
    notes: data.notes || null, unit_price_usd: data.unitPriceUsd || null,
    batch_number: data.batchNumber || null, created_by: data.createdBy || null,
  }).select("id").single();
  if (error) throw error;
  return result.id;
}

// ── PURCHASE ORDERS ──

export async function getPurchaseOrders(): Promise<PurchaseOrder[]> {
  const client = getClient();
  if (!client) return [];
  const { data } = await client.from("purchase_orders").select("*").order("created_at", { ascending: false });
  return (data || []).map((r) => toCamelCase(r as any) as any);
}

export async function getPurchaseOrderById(id: string): Promise<(PurchaseOrder & { items?: PurchaseOrderItem[] }) | null> {
  const client = getClient();
  if (!client) return null;
  const { data: po } = await client.from("purchase_orders").select("*").eq("id", id).single();
  if (!po) return null;
  const { data: items } = await client.from("purchase_order_items").select("*, products(name, sku)").eq("purchase_order_id", id);
  return {
    ...toCamelCase(po as any) as any,
    items: (items || []).map((i: any) => ({
      id: i.id, purchaseOrderId: i.purchase_order_id, productId: i.product_id,
      quantity: i.quantity, unitPriceUsd: i.unit_price_usd,
      receivedQuantity: i.received_quantity, notes: i.notes,
      productName: i.products?.name, productSku: i.products?.sku,
    })),
  };
}

export async function createPurchaseOrder(data: {
  supplier: string; poNumber?: string; notes?: string; createdBy?: string;
}): Promise<string | null> {
  const client = getClient();
  if (!client) return null;
  const poNumber = data.poNumber || `PO-${Date.now()}`;
  const { data: result, error } = await client.from("purchase_orders").insert({
    po_number: poNumber, supplier: data.supplier, notes: data.notes || null,
    status: "draft", created_by: data.createdBy || null,
  }).select("id").single();
  if (error) throw error;
  return result.id;
}

export async function updatePurchaseOrder(id: string, data: Partial<PurchaseOrder>): Promise<void> {
  const client = getClient();
  if (!client) return;
  const dbData: Record<string, unknown> = {};
  if (data.status !== undefined) dbData.status = data.status;
  if (data.supplier !== undefined) dbData.supplier = data.supplier;
  if (data.expectedDate !== undefined) dbData.expected_date = data.expectedDate;
  if (data.receivedDate !== undefined) dbData.received_date = data.receivedDate;
  if (data.totalAmountUsd !== undefined) dbData.total_amount_usd = data.totalAmountUsd;
  if (data.notes !== undefined) dbData.notes = data.notes;
  await client.from("purchase_orders").update(dbData).eq("id", id);
}

// ── PURCHASE ORDER ITEMS ──

export async function addPurchaseOrderItem(data: {
  purchaseOrderId: string; productId: string; quantity: number; unitPriceUsd?: number;
}): Promise<string | null> {
  const client = getClient();
  if (!client) return null;
  const { data: result, error } = await client.from("purchase_order_items").insert({
    purchase_order_id: data.purchaseOrderId, product_id: data.productId,
    quantity: data.quantity, unit_price_usd: data.unitPriceUsd || null,
  }).select("id").single();
  if (error) throw error;
  return result.id;
}

export async function receivePurchaseOrderItem(id: string, receivedQuantity: number): Promise<void> {
  const client = getClient();
  if (!client) return;
  await client.from("purchase_order_items").update({ received_quantity: receivedQuantity }).eq("id", id);
}

// ── DASHBOARD STATS ──

export async function getInventoryStats(): Promise<{
  totalProducts: number; lowStockItems: number; totalStockValue: number; recentMovements: number;
}> {
  const client = getClient();
  if (!client) return { totalProducts: 0, lowStockItems: 0, totalStockValue: 0, recentMovements: 0 };
  const [products, stock, movements] = await Promise.all([
    client.from("products").select("id, unit_price_usd", { count: "exact", head: false }),
    client.from("inventory_stock").select("quantity, products(unit_price_usd)"),
    client.from("stock_movements").select("id", { count: "exact", head: false }).gte("created_at", new Date(Date.now() - 7 * 86400000).toISOString()),
  ]);
  let lowStock = 0;
  let totalVal = 0;
  for (const s of stock.data || []) {
    const qty = (s as any).quantity || 0;
    const price = (s as any).products?.unit_price_usd || 0;
    if (qty <= 5) lowStock++;
    totalVal += qty * price;
  }
  return {
    totalProducts: products.count || 0,
    lowStockItems: lowStock,
    totalStockValue: totalVal,
    recentMovements: movements.count || 0,
  };
}
