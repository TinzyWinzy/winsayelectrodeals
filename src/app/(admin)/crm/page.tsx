"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { CalendarClock, Flame, MessageCircle, Phone, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { SkeletonTable } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { FollowUpRecord, LeadRecord, PipelineStatus } from "@/types/leads";
import { followUpTypeLabels, pipelineStatusLabels } from "@/types/leads";

const temperatureColors = {
  hot: "danger",
  warm: "warning",
  cold: "outline",
} as const;

const pipelineStatuses = Object.keys(pipelineStatusLabels) as PipelineStatus[];

export default function CrmPage() {
  const [leads, setLeads] = useState<LeadRecord[]>([]);
  const [followUps, setFollowUps] = useState<FollowUpRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<PipelineStatus | "all">("all");
  const [activeFollowUpLead, setActiveFollowUpLead] = useState<string | null>(null);
  const [followUpDate, setFollowUpDate] = useState("");
  const [followUpNotes, setFollowUpNotes] = useState("");

  const refresh = async () => {
    const [leadResult, followUpResult] = await Promise.all([
      fetch("/api/leads").then((r) => r.json()),
      fetch("/api/leads?type=follow-ups").then((r) => r.json()),
    ]);
    setLeads(leadResult.leads || []);
    setFollowUps(followUpResult.followUps || []);
    setLoading(false);
  };

  useEffect(() => {
    let cancelled = false;

    Promise.all([
      fetch("/api/leads").then((r) => r.json()),
      fetch("/api/leads?type=follow-ups").then((r) => r.json()),
    ]).then(([leadResult, followUpResult]) => {
      if (cancelled) return;
      setLeads(leadResult.leads || []);
      setFollowUps(followUpResult.followUps || []);
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    const query = search.toLowerCase();
    return leads.filter((lead) => {
      const matchesStatus = statusFilter === "all" || lead.pipelineStatus === statusFilter;
      const matchesSearch =
        lead.fullName.toLowerCase().includes(query) ||
        (lead.phone || "").toLowerCase().includes(query) ||
        (lead.whatsappNumber || "").toLowerCase().includes(query) ||
        (lead.recommendedPackageName || "").toLowerCase().includes(query) ||
        (lead.city || "").toLowerCase().includes(query);
      return matchesStatus && matchesSearch;
    });
  }, [leads, search, statusFilter]);

  const today = new Date();
  today.setHours(23, 59, 59, 999);
  const overdueFollowUps = followUps.filter((item) => new Date(item.dueAt) < new Date() && !item.completedAt);
  const dueTodayFollowUps = followUps.filter((item) => {
    const due = new Date(item.dueAt);
    return due <= today && due >= new Date(new Date().setHours(0, 0, 0, 0)) && !item.completedAt;
  });
  const hotLeads = leads.filter((lead) => lead.leadTemperature === "hot" && lead.pipelineStatus !== "lost" && lead.pipelineStatus !== "installed");

  const updateStatus = async (id: string, status: PipelineStatus) => {
    await fetch("/api/leads", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    setLeads((prev) => prev.map((lead) => (lead.id === id ? { ...lead, pipelineStatus: status } : lead)));
  };

  const scheduleFollowUp = async (lead: LeadRecord) => {
    if (!followUpDate) return;
    await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        leadId: lead.id,
        customerId: lead.customerId,
        followUpType: "whatsapp",
        dueAt: new Date(followUpDate).toISOString(),
        priority: lead.leadTemperature === "hot" ? "high" : "normal",
        notes: followUpNotes,
      }),
    });
    setActiveFollowUpLead(null);
    setFollowUpDate("");
    setFollowUpNotes("");
    await refresh();
  };

  const completeFollowUp = async (id: string) => {
    await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "complete-follow-up", id, outcome: "Completed from CRM workspace" }),
    });
    await refresh();
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-primary">Sales CRM Pipeline</h1>
        <p className="text-sm text-gray-500 mt-1">Lead movement, follow-ups, and sales accountability from real lead records.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard label="Hot open leads" value={hotLeads.length} icon={Flame} tone="danger" />
        <MetricCard label="Follow-ups due today" value={dueTodayFollowUps.length} icon={CalendarClock} tone="warning" />
        <MetricCard label="Overdue follow-ups" value={overdueFollowUps.length} icon={CalendarClock} tone="danger" />
      </div>

      {overdueFollowUps.length > 0 && (
        <Card className="border-danger/20 bg-danger/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-danger">Overdue Follow-Ups</h2>
              <Badge variant="danger">{overdueFollowUps.length}</Badge>
            </div>
            <div className="space-y-2">
              {overdueFollowUps.slice(0, 5).map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-3 text-sm">
                  <span>{followUpTypeLabels[item.followUpType]} due {new Date(item.dueAt).toLocaleString()}</span>
                  <Button size="sm" variant="outline" onClick={() => completeFollowUp(item.id)}>Mark Done</Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-5 space-y-4">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by customer, phone, package, or city..."
              className="w-full h-11 pl-10 pr-4 rounded-lg border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <button onClick={() => setStatusFilter("all")} className={`px-3 py-1.5 text-xs font-medium rounded-lg border ${statusFilter === "all" ? "bg-primary text-white border-primary" : "border-gray-300 text-gray-600"}`}>All</button>
            {pipelineStatuses.map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg border ${statusFilter === status ? "bg-primary text-white border-primary" : "border-gray-300 text-gray-600"}`}
              >
                {pipelineStatusLabels[status]}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <SkeletonTable rows={8} />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Lead</TableHead>
              <TableHead>Source</TableHead>
              <TableHead>Package</TableHead>
              <TableHead>Score</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Next Follow-Up</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-gray-400 py-12">No leads found</TableCell>
              </TableRow>
            ) : (
              filtered.map((lead) => (
                <TableRow key={lead.id}>
                  <TableCell>
                    <p className="font-medium text-primary">{lead.fullName}</p>
                    <p className="text-xs text-gray-500">{[lead.suburb, lead.city].filter(Boolean).join(", ") || "No location"}</p>
                    {lead.duplicateOf && <Badge variant="outline" className="mt-1">Possible duplicate</Badge>}
                  </TableCell>
                  <TableCell className="text-sm">{lead.source.replace(/_/g, " ")}</TableCell>
                  <TableCell className="text-sm">{lead.recommendedPackageName || "-"}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Badge variant={temperatureColors[lead.leadTemperature]}>{lead.leadTemperature.toUpperCase()}</Badge>
                      <span className="text-sm tabular-nums">{lead.leadScore}/100</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <select value={lead.pipelineStatus} onChange={(event) => updateStatus(lead.id, event.target.value as PipelineStatus)} className="h-9 px-2 rounded-lg border border-gray-300 bg-white text-xs">
                      {pipelineStatuses.map((status) => (
                        <option key={status} value={status}>{pipelineStatusLabels[status]}</option>
                      ))}
                    </select>
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">
                    {lead.nextFollowUpDate ? new Date(lead.nextFollowUpDate).toLocaleString() : "-"}
                  </TableCell>
                  <TableCell>
                    {activeFollowUpLead === lead.id ? (
                      <div className="space-y-2 min-w-[220px]">
                        <Input type="datetime-local" value={followUpDate} onChange={(event) => setFollowUpDate(event.target.value)} className="h-9 text-xs" />
                        <Input value={followUpNotes} onChange={(event) => setFollowUpNotes(event.target.value)} placeholder="Notes" className="h-9 text-xs" />
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => scheduleFollowUp(lead)}>Save</Button>
                          <Button size="sm" variant="ghost" onClick={() => setActiveFollowUpLead(null)}>Cancel</Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-1">
                        {lead.whatsappNumber && (
                          <a href={`https://wa.me/${lead.whatsappNumber.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-success hover:underline">
                            <MessageCircle className="w-3 h-3" /> WhatsApp
                          </a>
                        )}
                        {(lead.phone || lead.whatsappNumber) && (
                          <a href={`tel:${lead.phone || lead.whatsappNumber}`} className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
                            <Phone className="w-3 h-3" /> Call
                          </a>
                        )}
                        <Button size="sm" variant="outline" onClick={() => setActiveFollowUpLead(lead.id)}>Follow Up</Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      )}
    </motion.div>
  );
}

function MetricCard({ label, value, icon: Icon, tone }: { label: string; value: number; icon: typeof Flame; tone: "warning" | "danger" }) {
  return (
    <Card>
      <CardContent className="p-5 flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{label}</p>
          <p className="text-2xl font-bold text-primary mt-1">{value}</p>
        </div>
        <div className={`w-11 h-11 rounded-lg flex items-center justify-center ${tone === "danger" ? "bg-danger/10 text-danger" : "bg-warning/10 text-warning"}`}>
          <Icon className="w-5 h-5" />
        </div>
      </CardContent>
    </Card>
  );
}
