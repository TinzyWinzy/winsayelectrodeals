export type ProductCategory = "panel" | "battery" | "inverter" | "accessory" | "mounting" | "cable" | "other";
export type MovementType = "in" | "out" | "adjustment" | "transfer" | "damaged" | "return";
export type PoStatus = "draft" | "pending" | "approved" | "ordered" | "partial" | "received" | "cancelled";

export interface Product {
  id: string;
  name: string;
  sku: string | null;
  category: ProductCategory;
  brand: string | null;
  model: string | null;
  description: string | null;
  specifications: Record<string, unknown>;
  unit: string;
  unitPriceUsd: number | null;
  unitPriceZig: number | null;
  supplier: string | null;
  minStockLevel: number;
  active: boolean;
  imageUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface InventoryStock {
  id: string;
  productId: string;
  location: string;
  quantity: number;
  reservedQuantity: number;
  updatedAt: string;
}

export interface StockMovement {
  id: string;
  productId: string;
  movementType: MovementType;
  quantity: number;
  referenceType: string | null;
  referenceId: string | null;
  notes: string | null;
  unitPriceUsd: number | null;
  batchNumber: string | null;
  createdBy: string | null;
  createdAt: string;
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  supplier: string;
  status: PoStatus;
  orderDate: string;
  expectedDate: string | null;
  receivedDate: string | null;
  totalAmountUsd: number | null;
  notes: string | null;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PurchaseOrderItem {
  id: string;
  purchaseOrderId: string;
  productId: string;
  quantity: number;
  unitPriceUsd: number | null;
  receivedQuantity: number;
  notes: string | null;
}

export const productCategoryLabels: Record<ProductCategory, string> = {
  panel: "Solar Panel",
  battery: "Battery",
  inverter: "Inverter",
  accessory: "Accessory",
  mounting: "Mounting",
  cable: "Cable",
  other: "Other",
};

export const movementTypeLabels: Record<MovementType, string> = {
  in: "Stock In",
  out: "Stock Out",
  adjustment: "Adjustment",
  transfer: "Transfer",
  damaged: "Damaged",
  return: "Return",
};

export const poStatusLabels: Record<PoStatus, string> = {
  draft: "Draft",
  pending: "Pending",
  approved: "Approved",
  ordered: "Ordered",
  partial: "Partially Received",
  received: "Received",
  cancelled: "Cancelled",
};

export const poStatusColors: Record<PoStatus, "outline" | "warning" | "primary" | "success" | "danger"> = {
  draft: "outline",
  pending: "warning",
  approved: "primary",
  ordered: "primary",
  partial: "warning",
  received: "success",
  cancelled: "danger",
};

export const unitLabels: Record<string, string> = {
  piece: "Piece",
  meter: "Meter",
  kg: "Kilogram",
  liter: "Liter",
  set: "Set",
  box: "Box",
  unit: "Unit",
};
