"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Package, Box, ShoppingCart, Plus, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { SkeletonTable } from "@/components/ui/skeleton";
import type { Product, InventoryStock, StockMovement, PurchaseOrder, ProductCategory } from "@/types/inventory";
import { productCategoryLabels, unitLabels, movementTypeLabels, poStatusLabels, poStatusColors } from "@/types/inventory";

type InvTab = "products" | "stock" | "purchase-orders";

export default function InventoryPage() {
  const [tab, setTab] = useState<InvTab>("products");

  const tabs: { key: InvTab; label: string; icon: typeof Package }[] = [
    { key: "products", label: "Products", icon: Package },
    { key: "stock", label: "Stock Levels", icon: Box },
    { key: "purchase-orders", label: "Purchase Orders", icon: ShoppingCart },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit overflow-x-auto">
        {tabs.map(t => {
          const Icon = t.icon;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all whitespace-nowrap ${
                tab === t.key ? "bg-white text-primary shadow-sm" : "text-gray-500 hover:text-primary"
              }`}
            >
              <Icon className="w-4 h-4" /> {t.label}
            </button>
          );
        })}
      </div>

      {tab === "products" && <ProductsSection />}
      {tab === "stock" && <StockSection />}
      {tab === "purchase-orders" && <PurchaseOrdersSection />}
    </motion.div>
  );
}

function ProductsSection() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [edit, setEdit] = useState<Partial<Product>>({});
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => { fetch("/api/inventory?type=products").then(r => r.json()).then(setProducts).finally(() => setLoading(false)); }, []);

  const handleSave = async () => {
    if (!edit.name || !edit.category) return;
    if (editingId) {
      await fetch(`/api/inventory?type=product&id=${editingId}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(edit) });
    } else {
      await fetch("/api/inventory?type=product", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(edit) });
    }
    fetch("/api/inventory?type=products").then(r => r.json()).then(setProducts);
    setEditingId(null);
    setEdit({});
  };

  const filtered = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || (p.sku || "").toLowerCase().includes(search.toLowerCase()));

  if (loading) return <SkeletonTable rows={5} />;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Products</CardTitle>
        <div className="flex gap-2">
          <Input placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} className="h-9 text-sm w-48" />
          <Button size="sm" onClick={() => { setEditingId(null); setEdit({ name: "", category: "panel", unit: "piece" }); }}>
            <Plus className="w-4 h-4" /> Add Product
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {(editingId === null && edit.name !== undefined) && (
          <div className="border border-primary/20 rounded-lg p-4 space-y-3 bg-primary/5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Input placeholder="Product Name" value={edit.name || ""} onChange={e => setEdit(p => ({ ...p, name: e.target.value }))} />
              <Input placeholder="SKU (optional)" value={edit.sku || ""} onChange={e => setEdit(p => ({ ...p, sku: e.target.value }))} />
              <select value={edit.category || "panel"} onChange={e => setEdit(p => ({ ...p, category: e.target.value as ProductCategory }))}
                className="h-9 px-2 rounded-lg border border-gray-300 text-sm">
                {Object.entries(productCategoryLabels).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
              <select value={edit.unit || "piece"} onChange={e => setEdit(p => ({ ...p, unit: e.target.value }))}
                className="h-9 px-2 rounded-lg border border-gray-300 text-sm">
                {Object.entries(unitLabels).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
              <Input type="number" step="0.01" placeholder="Unit Price (USD)" value={edit.unitPriceUsd ?? ""} onChange={e => setEdit(p => ({ ...p, unitPriceUsd: parseFloat(e.target.value) || 0 }))} />
              <Input placeholder="Supplier (optional)" value={edit.supplier || ""} onChange={e => setEdit(p => ({ ...p, supplier: e.target.value }))} />
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={handleSave} disabled={!edit.name || !edit.category}>Save</Button>
              <Button size="sm" variant="ghost" onClick={() => setEdit({})}>Cancel</Button>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Unit</TableHead>
                <TableHead>Price (USD)</TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-gray-400 py-8">
                    {products.length === 0 ? "No products yet" : "No matching products"}
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map(p => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.name}</TableCell>
                    <TableCell className="text-sm text-gray-500 font-mono">{p.sku || "-"}</TableCell>
                    <TableCell><Badge variant="outline">{productCategoryLabels[p.category]}</Badge></TableCell>
                    <TableCell className="text-sm">{unitLabels[p.unit] || p.unit}</TableCell>
                    <TableCell className="tabular-nums">${(p.unitPriceUsd || 0).toFixed(2)}</TableCell>
                    <TableCell className="text-sm">{p.supplier || "-"}</TableCell>
                    <TableCell>
                      <Button size="sm" variant="ghost" onClick={() => { setEditingId(p.id); setEdit(p); }}>Edit</Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

function StockSection() {
  const [stock, setStock] = useState<(InventoryStock & { productName?: string; sku?: string })[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMovements, setViewMovements] = useState<string | null>(null);
  const [adjustForm, setAdjustForm] = useState<{ productId: string; quantity: string; movementType: string; notes: string } | null>(null);

  useEffect(() => {
    fetch("/api/inventory?type=stock").then(r => r.json()).then(setStock).finally(() => setLoading(false));
  }, []);

  const loadMovements = async (productId: string) => {
    const data = await fetch(`/api/inventory?type=movements&productId=${productId}`).then(r => r.json());
    setMovements(data);
    setViewMovements(productId);
  };

  const handleAdjust = async () => {
    if (!adjustForm || !adjustForm.productId || !adjustForm.quantity) return;
    await fetch("/api/inventory?type=stock-movement", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId: adjustForm.productId, movementType: adjustForm.movementType, quantity: parseInt(adjustForm.quantity), notes: adjustForm.notes }),
    });
    const data = await fetch("/api/inventory?type=stock").then(r => r.json());
    setStock(data);
    setAdjustForm(null);
  };

  if (loading) return <SkeletonTable rows={5} />;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Stock Levels</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {stock.length === 0 ? (
          <p className="text-center text-gray-400 py-8">No stock records. Add products first.</p>
        ) : (
          <div className="space-y-3">
            {stock.map(s => (
              <div key={s.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{s.productName || "Unknown Product"}</p>
                    <p className="text-sm text-gray-500">
                      Quantity: <span className={`font-semibold ${s.quantity <= 5 ? "text-red-500" : "text-primary"}`}>{s.quantity}</span>
                      {s.location && ` - ${s.location}`}
                      {s.sku && <span className="ml-2 text-xs text-gray-400">SKU: {s.sku}</span>}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {s.quantity <= 5 && <Badge variant="danger">Low Stock</Badge>}
                    <Button size="sm" variant="ghost" onClick={() => loadMovements(s.productId)}>Movements</Button>
                    <Button size="sm" variant="outline" onClick={() => setAdjustForm({ productId: s.productId, quantity: "", movementType: "in", notes: "" })}>Adjust</Button>
                  </div>
                </div>

                {adjustForm && adjustForm.productId === s.productId && (
                  <div className="mt-3 border-t pt-3 space-y-2">
                    <div className="flex gap-2 flex-wrap">
                      <Input type="number" placeholder="Quantity" value={adjustForm.quantity} onChange={e => setAdjustForm({ ...adjustForm, quantity: e.target.value })} className="h-9 text-sm w-28" />
                      <select value={adjustForm.movementType} onChange={e => setAdjustForm({ ...adjustForm, movementType: e.target.value })} className="h-9 px-2 rounded-lg border border-gray-300 text-sm">
                        {Object.entries(movementTypeLabels).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                      </select>
                      <Input placeholder="Notes" value={adjustForm.notes} onChange={e => setAdjustForm({ ...adjustForm, notes: e.target.value })} className="h-9 text-sm flex-1 min-w-[120px]" />
                      <Button size="sm" onClick={handleAdjust}><Save className="w-4 h-4" /></Button>
                      <Button size="sm" variant="ghost" onClick={() => setAdjustForm(null)}>Cancel</Button>
                    </div>
                  </div>
                )}

                {viewMovements === s.productId && (
                  <div className="mt-3 border-t pt-3">
                    <p className="text-sm font-medium mb-2">Stock Movements</p>
                    {movements.length === 0 ? (
                      <p className="text-xs text-gray-400">No movements recorded</p>
                    ) : (
                      <div className="space-y-1 max-h-40 overflow-y-auto">
                        {movements.map(m => (
                          <div key={m.id} className="flex items-center justify-between text-xs text-gray-600 py-1">
                            <span className={`font-medium ${m.quantity > 0 ? "text-green-600" : "text-red-600"}`}>{m.quantity > 0 ? "+" : ""}{m.quantity}</span>
                            <Badge variant="outline" className="text-[10px]">{movementTypeLabels[m.movementType]}</Badge>
                            <span>{m.notes || "-"}</span>
                            <span className="text-gray-400">{new Date(m.createdAt).toLocaleDateString()}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function PurchaseOrdersSection() {
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetch("/api/inventory?type=purchase-orders").then(r => r.json()).then(setOrders).finally(() => setLoading(false)); }, []);

  if (loading) return <SkeletonTable rows={5} />;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Purchase Orders</CardTitle>
        <Button size="sm" onClick={() => alert("Full PO creation form coming in next update")}>
          <Plus className="w-4 h-4" /> New PO
        </Button>
      </CardHeader>
      <CardContent>
        {orders.length === 0 ? (
          <p className="text-center text-gray-400 py-8">No purchase orders yet</p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>PO #</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Total (USD)</TableHead>
                  <TableHead>Ordered</TableHead>
                  <TableHead>Expected</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map(po => (
                  <TableRow key={po.id}>
                    <TableCell className="font-mono text-sm font-medium">{po.poNumber}</TableCell>
                    <TableCell>{po.supplier}</TableCell>
                    <TableCell><Badge variant={poStatusColors[po.status]}>{poStatusLabels[po.status]}</Badge></TableCell>
                    <TableCell className="tabular-nums">${(po.totalAmountUsd || 0).toFixed(2)}</TableCell>
                    <TableCell className="text-sm text-gray-500">{new Date(po.orderDate).toLocaleDateString()}</TableCell>
                    <TableCell className="text-sm text-gray-500">{po.expectedDate ? new Date(po.expectedDate).toLocaleDateString() : "-"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
