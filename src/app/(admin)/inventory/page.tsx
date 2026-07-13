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
import type { Product, InventoryStock, StockMovement, PurchaseOrder, ProductCategory, PoStatus } from "@/types/inventory";
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
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ supplier: "", poNumber: "", expectedDate: "", notes: "" });
  const [items, setItems] = useState([{ productId: "", quantity: "1", unitPriceUsd: "" }]);

  const loadOrders = async () => {
    const data = await fetch("/api/inventory?type=purchase-orders").then(r => r.json());
    setOrders(data);
  };

  useEffect(() => {
    Promise.all([
      fetch("/api/inventory?type=purchase-orders").then(r => r.json()),
      fetch("/api/inventory?type=products").then(r => r.json()),
    ])
      .then(([orderData, productData]) => {
        setOrders(orderData);
        setProducts(productData);
      })
      .finally(() => setLoading(false));
  }, []);

  const resetForm = () => {
    setForm({ supplier: "", poNumber: "", expectedDate: "", notes: "" });
    setItems([{ productId: "", quantity: "1", unitPriceUsd: "" }]);
    setShowForm(false);
  };

  const handleCreate = async () => {
    if (!form.supplier.trim()) return;
    const validItems = items
      .map(item => ({
        productId: item.productId,
        quantity: parseInt(item.quantity, 10),
        unitPriceUsd: item.unitPriceUsd ? parseFloat(item.unitPriceUsd) : undefined,
      }))
      .filter(item => item.productId && item.quantity > 0);

    setSaving(true);
    try {
      const response = await fetch("/api/inventory?type=purchase-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          supplier: form.supplier.trim(),
          poNumber: form.poNumber.trim() || undefined,
          notes: form.notes.trim() || undefined,
        }),
      });
      const { id } = await response.json();
      if (!response.ok || !id) throw new Error("Could not create purchase order");

      await Promise.all(validItems.map(item => fetch("/api/inventory?type=po-item", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...item, purchaseOrderId: id }),
      })));

      const totalAmountUsd = validItems.reduce((sum, item) => sum + item.quantity * (item.unitPriceUsd || 0), 0);
      await fetch(`/api/inventory?type=purchase-order&id=${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          expectedDate: form.expectedDate || null,
          totalAmountUsd: totalAmountUsd || null,
          status: "pending",
        }),
      });

      await loadOrders();
      resetForm();
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (id: string, status: PoStatus) => {
    await fetch(`/api/inventory?type=purchase-order&id=${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setOrders(prev => prev.map(order => order.id === id ? { ...order, status } : order));
  };

  if (loading) return <SkeletonTable rows={5} />;

  const estimatedTotal = items.reduce((sum, item) => {
    const quantity = parseInt(item.quantity, 10) || 0;
    const unitPrice = parseFloat(item.unitPriceUsd) || 0;
    return sum + quantity * unitPrice;
  }, 0);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Purchase Orders</CardTitle>
        <Button size="sm" onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4" /> New PO
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {showForm && (
          <div className="border border-primary/20 rounded-lg p-4 space-y-4 bg-primary/5">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              <Input placeholder="Supplier" value={form.supplier} onChange={e => setForm(p => ({ ...p, supplier: e.target.value }))} />
              <Input placeholder="PO number (auto if blank)" value={form.poNumber} onChange={e => setForm(p => ({ ...p, poNumber: e.target.value }))} />
              <Input type="date" value={form.expectedDate} onChange={e => setForm(p => ({ ...p, expectedDate: e.target.value }))} />
              <Input placeholder="Notes" value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} />
            </div>

            <div className="space-y-2">
              {items.map((item, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-[1fr_110px_140px_auto] gap-2">
                  <select
                    value={item.productId}
                    onChange={e => setItems(prev => prev.map((line, i) => i === index ? { ...line, productId: e.target.value } : line))}
                    className="h-12 px-3 rounded-lg border border-gray-300 bg-white text-sm"
                  >
                    <option value="">Select product</option>
                    {products.map(product => (
                      <option key={product.id} value={product.id}>
                        {product.name}{product.sku ? ` (${product.sku})` : ""}
                      </option>
                    ))}
                  </select>
                  <Input type="number" min={1} placeholder="Qty" value={item.quantity} onChange={e => setItems(prev => prev.map((line, i) => i === index ? { ...line, quantity: e.target.value } : line))} />
                  <Input type="number" min={0} step="0.01" placeholder="Unit USD" value={item.unitPriceUsd} onChange={e => setItems(prev => prev.map((line, i) => i === index ? { ...line, unitPriceUsd: e.target.value } : line))} />
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => setItems(prev => prev.length === 1 ? prev : prev.filter((_, i) => i !== index))}
                    disabled={items.length === 1}
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <Button type="button" size="sm" variant="outline" onClick={() => setItems(prev => [...prev, { productId: "", quantity: "1", unitPriceUsd: "" }])}>
                <Plus className="w-4 h-4" /> Add Item
              </Button>
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-600">Estimated total: ${estimatedTotal.toFixed(2)}</span>
                <Button size="sm" onClick={handleCreate} disabled={saving || !form.supplier.trim()}>
                  <Save className="w-4 h-4" /> {saving ? "Saving..." : "Create PO"}
                </Button>
                <Button size="sm" variant="ghost" onClick={resetForm} disabled={saving}>Cancel</Button>
              </div>
            </div>
          </div>
        )}

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
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Badge variant={poStatusColors[po.status]}>{poStatusLabels[po.status]}</Badge>
                        <select
                          value={po.status}
                          onChange={e => handleStatusChange(po.id, e.target.value as PoStatus)}
                          className="h-8 px-2 rounded-lg border border-gray-300 bg-white text-xs"
                          aria-label={`Update status for ${po.poNumber}`}
                        >
                          {Object.entries(poStatusLabels).map(([value, label]) => (
                            <option key={value} value={value}>{label}</option>
                          ))}
                        </select>
                      </div>
                    </TableCell>
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
