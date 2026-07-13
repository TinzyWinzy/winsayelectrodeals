"use client";

import NextImage from "next/image";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, Trash2, Image, Star, FileText, Layout, Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import type { CmsHeroSlide, CmsTestimonial, CmsSiteContent, CmsBrand, CmsSiteSetting } from "@/types/cms";

type CmsTab = "hero" | "testimonials" | "content" | "brands" | "settings";

export default function CmsPage() {
  const [tab, setTab] = useState<CmsTab>("hero");

  const tabs: { key: CmsTab; label: string; icon: typeof Star }[] = [
    { key: "hero", label: "Hero Slides", icon: Image },
    { key: "testimonials", label: "Testimonials", icon: Star },
    { key: "content", label: "Site Content", icon: FileText },
    { key: "brands", label: "Brands", icon: Layout },
    { key: "settings", label: "Settings", icon: Settings2 },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit overflow-x-auto">
        {tabs.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all whitespace-nowrap ${
                tab === t.key ? "bg-white text-primary shadow-sm" : "text-gray-500 hover:text-primary"
              }`}
            >
              <Icon className="w-4 h-4" />
              {t.label}
            </button>
          );
        })}
      </div>

      {tab === "hero" && <HeroSection />}
      {tab === "testimonials" && <TestimonialsSection />}
      {tab === "content" && <ContentSection />}
      {tab === "brands" && <BrandsSection />}
      {tab === "settings" && <SettingsSection />}
    </motion.div>
  );
}

function HeroSection() {
  const [slides, setSlides] = useState<CmsHeroSlide[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [edit, setEdit] = useState<Partial<CmsHeroSlide>>({});
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/cms?type=hero").then(r => r.json()).then(setSlides).finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    if (!edit.title) return;
    setSaving(true);
    if (editingId) {
      await fetch(`/api/cms?type=hero&id=${editingId}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(edit) });
    } else {
      const res = await fetch("/api/cms?type=hero", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(edit) });
      const { id } = await res.json();
      setSlides(prev => [...prev, { id, title: edit.title || "", subtitle: edit.subtitle || null, imageUrl: edit.imageUrl || null, sortOrder: edit.sortOrder ?? prev.length, active: true, ctaText: null, ctaLink: null, overlayColor: null, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }]);
    }
    fetch("/api/cms?type=hero").then(r => r.json()).then(setSlides);
    setEditingId(null);
    setEdit({});
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/cms?type=hero&id=${id}`, { method: "DELETE" });
    setSlides(prev => prev.filter(s => s.id !== id));
  };

  if (loading) return <Spinner size="lg" />;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Hero Slides</CardTitle>
        <Button size="sm" onClick={() => { setEditingId(null); setEdit({ title: "", subtitle: "", imageUrl: "" }); }}>
          <Plus className="w-4 h-4" /> Add Slide
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {(editingId === null && edit.title !== undefined) && (
          <div className="border border-primary/20 rounded-lg p-4 space-y-3 bg-primary/5">
            <Input placeholder="Title" value={edit.title || ""} onChange={e => setEdit(p => ({ ...p, title: e.target.value }))} />
            <Input placeholder="Subtitle" value={edit.subtitle || ""} onChange={e => setEdit(p => ({ ...p, subtitle: e.target.value }))} />
            <Input placeholder="Image URL" value={edit.imageUrl || ""} onChange={e => setEdit(p => ({ ...p, imageUrl: e.target.value }))} />
            <Input type="number" placeholder="Sort Order" value={edit.sortOrder ?? slides.length} onChange={e => setEdit(p => ({ ...p, sortOrder: parseInt(e.target.value) || 0 }))} />
            <div className="flex gap-2">
              <Button size="sm" onClick={handleSave} disabled={saving || !edit.title}>Save</Button>
              <Button size="sm" variant="ghost" onClick={() => setEdit({})}>Cancel</Button>
            </div>
          </div>
        )}
        {slides.map(slide => (
          <div key={slide.id} className="flex items-center justify-between border rounded-lg p-4">
            <div className="flex items-center gap-4">
              {slide.imageUrl && (
                <NextImage
                  src={slide.imageUrl}
                  alt=""
                  width={64}
                  height={48}
                  className="w-16 h-12 rounded object-cover"
                />
              )}
              <div>
                <p className="font-medium">{slide.title}</p>
                <p className="text-sm text-gray-500">{slide.subtitle}</p>
                <div className="flex gap-2 mt-1">
                  {!slide.active && <Badge variant="outline">Inactive</Badge>}
                  <span className="text-xs text-gray-400">Order: {slide.sortOrder}</span>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="ghost" onClick={() => { setEditingId(slide.id); setEdit(slide); }}>Edit</Button>
              <Button size="sm" variant="danger" onClick={() => handleDelete(slide.id)}><Trash2 className="w-4 h-4" /></Button>
            </div>
          </div>
        ))}
        {slides.length === 0 && <p className="text-center text-gray-400 py-8">No hero slides yet</p>}
      </CardContent>
    </Card>
  );
}

function TestimonialsSection() {
  const [items, setItems] = useState<CmsTestimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [edit, setEdit] = useState<Partial<CmsTestimonial>>({});
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/cms?type=testimonials").then(r => r.json()).then(setItems).finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    if (!edit.customerName || !edit.content) return;
    setSaving(true);
    if (editingId) {
      await fetch(`/api/cms?type=testimonials&id=${editingId}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(edit) });
    } else {
      await fetch("/api/cms?type=testimonials", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(edit) });
    }
    fetch("/api/cms?type=testimonials").then(r => r.json()).then(setItems);
    setEditingId(null);
    setEdit({});
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/cms?type=testimonials&id=${id}`, { method: "DELETE" });
    setItems(prev => prev.filter(s => s.id !== id));
  };

  if (loading) return <Spinner size="lg" />;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Testimonials</CardTitle>
        <Button size="sm" onClick={() => { setEditingId(null); setEdit({ customerName: "", content: "", rating: 5 }); }}>
          <Plus className="w-4 h-4" /> Add Testimonial
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {(editingId === null && edit.customerName !== undefined) && (
          <div className="border border-primary/20 rounded-lg p-4 space-y-3 bg-primary/5">
            <Input placeholder="Customer Name" value={edit.customerName || ""} onChange={e => setEdit(p => ({ ...p, customerName: e.target.value }))} />
            <textarea placeholder="Content" value={edit.content || ""} onChange={e => setEdit(p => ({ ...p, content: e.target.value }))} className="w-full h-24 px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
            <Input type="number" min={1} max={5} placeholder="Rating (1-5)" value={edit.rating ?? 5} onChange={e => setEdit(p => ({ ...p, rating: parseInt(e.target.value) || 5 }))} />
            <Input placeholder="Location (optional)" value={edit.location || ""} onChange={e => setEdit(p => ({ ...p, location: e.target.value }))} />
            <div className="flex gap-2">
              <Button size="sm" onClick={handleSave} disabled={saving || !edit.customerName || !edit.content}>Save</Button>
              <Button size="sm" variant="ghost" onClick={() => setEdit({})}>Cancel</Button>
            </div>
          </div>
        )}
        {items.map(item => (
          <div key={item.id} className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="font-medium">{item.customerName}</p>
                {item.location && <p className="text-sm text-gray-500">{item.location}</p>}
              </div>
              <div className="flex gap-2 items-center">
                <span className="text-sm text-amber-500">{"★".repeat(item.rating)}{"☆".repeat(5 - item.rating)}</span>
                <Button size="sm" variant="ghost" onClick={() => { setEditingId(item.id); setEdit(item); }}>Edit</Button>
                <Button size="sm" variant="danger" onClick={() => handleDelete(item.id)}><Trash2 className="w-4 h-4" /></Button>
              </div>
            </div>
            <p className="text-sm text-gray-600 italic">&ldquo;{item.content}&rdquo;</p>
          </div>
        ))}
        {items.length === 0 && <p className="text-center text-gray-400 py-8">No testimonials yet</p>}
      </CardContent>
    </Card>
  );
}

function ContentSection() {
  const [items, setItems] = useState<CmsSiteContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/cms?type=content").then(r => r.json()).then(setItems).finally(() => setLoading(false));
  }, []);

  const handleUpdate = async (id: string, body: string) => {
    setSaving(true);
    await fetch(`/api/cms?type=content&id=${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ body }) });
    setItems(prev => prev.map(i => i.id === id ? { ...i, body } : i));
    setSaving(false);
  };

  if (loading) return <Spinner size="lg" />;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Site Content</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {items.map(item => (
          <div key={item.id} className="border rounded-lg p-4">
            <label className="text-sm font-medium text-gray-700 block mb-1.5">{item.sectionKey}</label>
            {item.sectionKey && (item.sectionKey.includes("_html") || item.sectionKey.includes("body_")) ? (
              <textarea
                value={item.body || ""}
                onChange={e => handleUpdate(item.id, e.target.value)}
                className="w-full h-32 px-3 py-2 rounded-lg border border-gray-300 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            ) : (
              <Input value={item.body || ""} onChange={e => handleUpdate(item.id, e.target.value)} />
            )}
            {saving && <Spinner size="sm" />}
          </div>
        ))}
        {items.length === 0 && <p className="text-center text-gray-400 py-8">No content sections found</p>}
      </CardContent>
    </Card>
  );
}

function BrandsSection() {
  const [items, setItems] = useState<CmsBrand[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [edit, setEdit] = useState<Partial<CmsBrand>>({});
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/cms?type=brands").then(r => r.json()).then(setItems).finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    if (!edit.name) return;
    setSaving(true);
    if (editingId) {
      await fetch(`/api/cms?type=brands&id=${editingId}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(edit) });
    } else {
      await fetch("/api/cms?type=brands", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(edit) });
    }
    fetch("/api/cms?type=brands").then(r => r.json()).then(setItems);
    setEditingId(null);
    setEdit({});
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/cms?type=brands&id=${id}`, { method: "DELETE" });
    setItems(prev => prev.filter(s => s.id !== id));
  };

  if (loading) return <Spinner size="lg" />;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Brands</CardTitle>
        <Button size="sm" onClick={() => { setEditingId(null); setEdit({ name: "", logoUrl: "" }); }}>
          <Plus className="w-4 h-4" /> Add Brand
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {(editingId === null && edit.name !== undefined) && (
          <div className="border border-primary/20 rounded-lg p-4 space-y-3 bg-primary/5">
            <Input placeholder="Brand Name" value={edit.name || ""} onChange={e => setEdit(p => ({ ...p, name: e.target.value }))} />
            <Input placeholder="Logo URL" value={edit.logoUrl || ""} onChange={e => setEdit(p => ({ ...p, logoUrl: e.target.value }))} />
            <Input type="number" placeholder="Sort Order" value={edit.sortOrder ?? items.length} onChange={e => setEdit(p => ({ ...p, sortOrder: parseInt(e.target.value) || 0 }))} />
            <div className="flex gap-2">
              <Button size="sm" onClick={handleSave} disabled={saving || !edit.name}>Save</Button>
              <Button size="sm" variant="ghost" onClick={() => setEdit({})}>Cancel</Button>
            </div>
          </div>
        )}
        {items.map(item => (
          <div key={item.id} className="flex items-center justify-between border rounded-lg p-4">
            <div className="flex items-center gap-4">
              {item.logoUrl && (
                <NextImage
                  src={item.logoUrl}
                  alt={item.name}
                  width={48}
                  height={48}
                  className="w-12 h-12 rounded object-contain bg-gray-50"
                />
              )}
              <div>
                <p className="font-medium">{item.name}</p>
                <span className="text-xs text-gray-400">Order: {item.sortOrder}</span>
              </div>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="ghost" onClick={() => { setEditingId(item.id); setEdit(item); }}>Edit</Button>
              <Button size="sm" variant="danger" onClick={() => handleDelete(item.id)}><Trash2 className="w-4 h-4" /></Button>
            </div>
          </div>
        ))}
        {items.length === 0 && <p className="text-center text-gray-400 py-8">No brands yet</p>}
      </CardContent>
    </Card>
  );
}

function SettingsSection() {
  const [items, setItems] = useState<CmsSiteSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/cms?type=settings").then(r => r.json()).then(setItems).finally(() => setLoading(false));
  }, []);

  const handleUpdate = async (id: string, settingValue: string) => {
    setSaving(true);
    await fetch(`/api/cms?type=settings&id=${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ value: settingValue }) });
    setItems(prev => prev.map(i => i.id === id ? { ...i, settingValue } : i));
    setSaving(false);
  };

  if (loading) return <Spinner size="lg" />;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Site Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {items.map(item => (
          <div key={item.id} className="border rounded-lg p-4">
            <label className="text-sm font-medium text-gray-700 block mb-1.5 capitalize">{item.settingKey.replace(/_/g, " ")}</label>
            {item.settingType === "boolean" ? (
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={item.settingValue === "true"} onChange={e => handleUpdate(item.id, e.target.checked ? "true" : "false")} className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary" />
                <span className="text-sm text-gray-600">{item.settingValue === "true" ? "Enabled" : "Disabled"}</span>
              </label>
            ) : item.settingType === "number" ? (
              <Input type="number" value={item.settingValue || ""} onChange={e => handleUpdate(item.id, e.target.value)} />
            ) : (
              <Input value={item.settingValue || ""} onChange={e => handleUpdate(item.id, e.target.value)} />
            )}
            {item.description && <p className="text-xs text-gray-400 mt-1">{item.description}</p>}
            {saving && <Spinner size="sm" />}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
