import { NextResponse } from "next/server";
import {
  getProducts, getProductById, createProduct, updateProduct,
  getInventoryStock, getStockMovements, createStockMovement,
  getPurchaseOrders, getPurchaseOrderById, createPurchaseOrder, updatePurchaseOrder, addPurchaseOrderItem, receivePurchaseOrderItem,
  getInventoryStats,
} from "@/lib/inventory-db";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const type = url.searchParams.get("type") || "products";
  const id = url.searchParams.get("id");
  const productId = url.searchParams.get("productId");

  try {
    let data;
    switch (type) {
      case "products": data = await getProducts(); break;
      case "product": if (!id) return NextResponse.json({ error: "id required" }, { status: 400 }); data = await getProductById(id); break;
      case "stock": data = await getInventoryStock(); break;
      case "movements": data = await getStockMovements(productId || undefined); break;
      case "purchase-orders": data = await getPurchaseOrders(); break;
      case "purchase-order": if (!id) return NextResponse.json({ error: "id required" }, { status: 400 }); data = await getPurchaseOrderById(id); break;
      case "stats": data = await getInventoryStats(); break;
      default: return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const url = new URL(request.url);
  const type = url.searchParams.get("type") || "product";
  const body = await request.json();

  try {
    let id: string | null = null;
    switch (type) {
      case "product": id = await createProduct(body); break;
      case "stock-movement": id = await createStockMovement(body); break;
      case "purchase-order": id = await createPurchaseOrder(body); break;
      case "po-item": id = await addPurchaseOrderItem(body); break;
      case "receive-item": await receivePurchaseOrderItem(body.id, body.receivedQuantity); return NextResponse.json({ success: true });
      default: return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }
    return NextResponse.json({ id }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const url = new URL(request.url);
  const type = url.searchParams.get("type") || "product";
  const id = url.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  const body = await request.json();

  try {
    switch (type) {
      case "product": await updateProduct(id, body); break;
      case "purchase-order": await updatePurchaseOrder(id, body); break;
      default: return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
