"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Download, Search, Filter, Calendar, Phone, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SkeletonTable } from "@/components/ui/skeleton";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { subscribeToQuotes, getPackageById, updateQuote, createInstallSchedule } from "@/lib/db";
import { formatUsd } from "@/lib/utils";
import type { Quote, QuoteStatus } from "@/types";
import { getLeads, updateLeadStatus } from "@/lib/solar-finder/db";
import type { SolarFinderLead, LeadStatus } from "@/types/solar-finder";
import { leadStatusLabels, budgetLabels, timelineLabels } from "@/types/solar-finder";

const statusFlow: Record<QuoteStatus, QuoteStatus[]> = {
  pending: ["deposit_paid", "cancelled"],
  deposit_paid: ["fully_paid", "installed", "cancelled"],
  fully_paid: ["installed", "cancelled"],
  installed: [],
  cancelled: [],
};

const statusColors: Record<QuoteStatus, "warning" | "success" | "danger" | "primary" | "outline"> = {
  pending: "warning",
  deposit_paid: "success",
  fully_paid: "success",
  installed: "primary",
  cancelled: "danger",
};

const statusLabels: Record<QuoteStatus, string> = {
  pending: "Pending",
  deposit_paid: "Deposit Paid",
  fully_paid: "Full Paid",
  installed: "Installed",
  cancelled: "Cancelled",
};

const leadStatusColors: Record<LeadStatus, "warning" | "success" | "danger" | "primary" | "outline"> = {
  new: "warning",
  contacted: "primary",
  qualified: "primary",
  quoted: "primary",
  "installation-booked": "success",
  won: "success",
  lost: "danger",
};

export default function LeadsPage() {
  const [activeTab, setActiveTab] = useState<"quotes" | "solar-finder">("quotes");
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [packageCache, setPackageCache] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<QuoteStatus | "all">("all");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [schedulingId, setSchedulingId] = useState<string | null>(null);
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleInstaller, setScheduleInstaller] = useState("");

  useEffect(() => {
    const unsub = subscribeToQuotes(async (updatedQuotes) => {
      setQuotes(updatedQuotes);
      setLoading(false);
      const pkgIds = [...new Set(updatedQuotes.map((q) => q.packageId))];
      const cache: Record<string, string> = {};
      await Promise.all(
        pkgIds.map(async (id) => {
          try {
            const pkg = await getPackageById(id);
            if (pkg) cache[id] = pkg.name;
          } catch {}
        })
      );
      setPackageCache((prev) => ({ ...prev, ...cache }));
    });
    return unsub;
  }, []);

  const filtered = useMemo(() => {
    return quotes.filter((q) => {
      const matchesSearch =
        q.quoteId.toLowerCase().includes(search.toLowerCase());
      const matchesStatus =
        statusFilter === "all" || q.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [quotes, search, statusFilter]);

  const handleStatusChange = async (quote: Quote, newStatus: QuoteStatus) => {
    setUpdatingId(quote.id);
    try {
      await updateQuote(quote.id, { status: newStatus } as Record<string, unknown>);
      setQuotes((prev) =>
        prev.map((q) => (q.id === quote.id ? { ...q, status: newStatus } : q))
      );
    } catch {
    } finally {
      setUpdatingId(null);
    }
  };

  const handleScheduleSubmit = async (quote: Quote) => {
    if (!scheduleDate) return;
    setUpdatingId(quote.id);
    try {
      await createInstallSchedule({
        quoteId: quote.id,
        installDate: scheduleDate,
        installerName: scheduleInstaller || null,
        status: "scheduled",
        notes: null,
      });
      if (quote.status !== "installed") {
        await updateQuote(quote.id, { status: "installed" } as Record<string, unknown>);
        setQuotes((prev) =>
          prev.map((q) => (q.id === quote.id ? { ...q, status: "installed" } : q))
        );
      }
      setSchedulingId(null);
      setScheduleDate("");
      setScheduleInstaller("");
    } catch {
    } finally {
      setUpdatingId(null);
    }
  };

  const handleExportCsv = () => {
    const headers = ["Quote ID", "Status", "Amount (USD)", "Deposit (USD)", "Pay After Install", "Date"];
    const rows = filtered.map((q) => [
      q.quoteId,
      statusLabels[q.status],
      q.totalUsd.toString(),
      q.depositUsd.toString(),
      q.payAfterInstall ? "Yes" : "No",
      new Date(q.createdAt).toLocaleDateString(),
    ]);

    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `winsay-leads-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Solar Finder leads state
  const [sfLeads, setSfLeads] = useState<SolarFinderLead[]>([]);
  const [sfLoading, setSfLoading] = useState(true);
  const [sfSearch, setSfSearch] = useState("");
  const [sfStatusFilter, setSfStatusFilter] = useState<LeadStatus | "all">("all");
  const [sfPackageFilter, setSfPackageFilter] = useState<string>("all");
  const [sfUpdatingId, setSfUpdatingId] = useState<string | null>(null);
  useEffect(() => {
    if (activeTab !== "solar-finder") return;
    getLeads().then((leads) => {
      setSfLeads(leads);
      setSfLoading(false);
    });
  }, [activeTab]);

  const sfFiltered = useMemo(() => {
    return sfLeads.filter((l) => {
      const matchesSearch =
        l.fullName.toLowerCase().includes(sfSearch.toLowerCase()) ||
        l.whatsappNumber.includes(sfSearch) ||
        l.recommendedPackageName.toLowerCase().includes(sfSearch.toLowerCase());
      const matchesStatus = sfStatusFilter === "all" || l.status === sfStatusFilter;
      const matchesPackage = sfPackageFilter === "all" || l.recommendedPackageId === sfPackageFilter;
      return matchesSearch && matchesStatus && matchesPackage;
    });
  }, [sfLeads, sfSearch, sfStatusFilter, sfPackageFilter]);

  const handleSfStatusChange = async (id: string, status: LeadStatus) => {
    setSfUpdatingId(id);
    try {
      await updateLeadStatus(id, status);
      setSfLeads((prev) =>
        prev.map((l) => (l.id === id ? { ...l, status } : l))
      );
    } catch {
    } finally {
      setSfUpdatingId(null);
    }
  };

  const sfPackageOptions = [
    { value: "all", label: "All Packages" },
    ...Array.from(new Set(sfLeads.map((l) => l.recommendedPackageId))).map((id) => ({
      value: id,
      label: sfLeads.find((l) => l.recommendedPackageId === id)?.recommendedPackageName || id,
    })),
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit">
        <button
          onClick={() => setActiveTab("quotes")}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
            activeTab === "quotes"
              ? "bg-white text-primary shadow-sm"
              : "text-gray-500 hover:text-primary"
          }`}
        >
          Quote Leads
        </button>
        <button
          onClick={() => setActiveTab("solar-finder")}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
            activeTab === "solar-finder"
              ? "bg-white text-primary shadow-sm"
              : "text-gray-500 hover:text-primary"
          }`}
        >
          Solar Finder Leads
        </button>
      </div>

      {renderContent()}
    </motion.div>
  );

  function renderContent() {
    if (activeTab === "solar-finder") {
      return (
        <div className="space-y-6">
          <Card className="border-0 shadow-sm bg-white">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h1 className="text-xl font-bold text-primary">Solar Finder Leads</h1>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {sfLoading ? "Loading..." : `${sfFiltered.length} lead${sfFiltered.length !== 1 ? "s" : ""}`}
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Search by name, phone, or package..."
                    value={sfSearch}
                    onChange={(e) => setSfSearch(e.target.value)}
                    className="w-full h-11 pl-10 pr-4 rounded-lg border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </div>
                <select
                  value={sfPackageFilter}
                  onChange={(e) => setSfPackageFilter(e.target.value)}
                  className="h-11 px-3 rounded-lg border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                >
                  {sfPackageOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-2 flex-wrap mb-4">
                {(["all", "new", "contacted", "qualified", "quoted", "installation-booked", "won", "lost"] as const).map(
                  (status) => (
                    <button
                      key={status}
                      onClick={() => setSfStatusFilter(status)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
                        sfStatusFilter === status
                          ? "bg-primary text-white border-primary shadow-sm"
                          : "border-gray-300 text-gray-600 hover:border-gray-400 hover:bg-gray-50"
                      }`}
                    >
                      {status === "all" ? "All" : leadStatusLabels[status]}
                    </button>
                  )
                )}
              </div>
            </CardContent>
          </Card>

          {sfLoading ? (
            <SkeletonTable rows={5} />
          ) : (
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Package</TableHead>
                    <TableHead>Budget</TableHead>
                    <TableHead>Urgency</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sfFiltered.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center text-gray-400 py-12">
                        <div className="flex flex-col items-center gap-2">
                          <Filter className="w-5 h-5 text-gray-300" />
                          <p className="text-sm">No solar finder leads found</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    sfFiltered.map((lead) => (
                      <TableRow key={lead.id}>
                        <TableCell>
                          <p className="text-sm font-medium text-primary">{lead.fullName}</p>
                          {lead.email && (
                            <p className="text-xs text-gray-400">{lead.email}</p>
                          )}
                        </TableCell>
                        <TableCell className="text-sm font-mono">{lead.whatsappNumber}</TableCell>
                        <TableCell className="text-sm text-gray-500">
                          {[lead.city, lead.suburb].filter(Boolean).join(", ") || "-"}
                        </TableCell>
                        <TableCell className="text-sm font-medium">{lead.recommendedPackageName}</TableCell>
                        <TableCell className="text-sm">
                          {lead.budget ? budgetLabels[lead.budget] : "-"}
                        </TableCell>
                        <TableCell className="text-sm">
                          {timelineLabels[lead.installationTimeline]}
                        </TableCell>
                        <TableCell>
                          <Badge variant={leadStatusColors[lead.status]}>
                            {leadStatusLabels[lead.status]}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-gray-500">
                          {new Date(lead.timestamp).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1 flex-col">
                            <a
                              href={`https://wa.me/${lead.whatsappNumber.replace(/\D/g, "")}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-lg bg-success/10 text-success hover:bg-success/20 transition-colors"
                            >
                              <MessageCircle className="w-3 h-3" />
                              WhatsApp
                            </a>
                            <a
                              href={`tel:${lead.whatsappNumber}`}
                              className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                            >
                              <Phone className="w-3 h-3" />
                              Call
                            </a>
                            <select
                              value={lead.status}
                              onChange={(e) => handleSfStatusChange(lead.id, e.target.value as LeadStatus)}
                              disabled={sfUpdatingId === lead.id}
                              className="text-xs border border-gray-300 rounded-lg px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-primary/20"
                            >
                              {(Object.entries(leadStatusLabels) as [LeadStatus, string][]).map(
                                ([value, label]) => (
                                  <option key={value} value={value}>
                                    {label}
                                  </option>
                                )
                              )}
                            </select>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      );
    }

    return (
      <>
        <Card className="border-0 shadow-sm bg-white">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h1 className="text-xl font-bold text-primary">Quote Leads</h1>
                <p className="text-sm text-gray-500 mt-0.5">
                  {loading ? "Loading..." : `${filtered.length} lead${filtered.length !== 1 ? "s" : ""}`}
                </p>
              </div>
              <Button variant="outline" onClick={handleExportCsv} disabled={loading}>
                <Download className="w-4 h-4" />
                Export CSV
              </Button>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search by quote ID..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full h-11 pl-10 pr-4 rounded-lg border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                {(["all", "pending", "deposit_paid", "fully_paid", "installed", "cancelled"] as const).map(
                  (status) => (
                    <button
                      key={status}
                      onClick={() => setStatusFilter(status)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
                        statusFilter === status
                          ? "bg-primary text-white border-primary shadow-sm"
                          : "border-gray-300 text-gray-600 hover:border-gray-400 hover:bg-gray-50"
                      }`}
                    >
                      {status === "all" ? "All" : statusLabels[status]}
                    </button>
                  )
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {loading ? (
          <SkeletonTable rows={5} />
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Quote ID</TableHead>
                  <TableHead>Package</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Deposit</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-gray-400 py-12">
                      <div className="flex flex-col items-center gap-2">
                        <Filter className="w-5 h-5 text-gray-300" />
                        <p className="text-sm">No leads found</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((q) => {
                    const nextStatuses = statusFlow[q.status];
                    return (
                      <TableRow key={q.id}>
                        <TableCell className="font-mono text-xs font-medium">
                          {q.quoteId}
                        </TableCell>
                        <TableCell>{packageCache[q.packageId] || "-"}</TableCell>
                        <TableCell className="tabular-nums font-medium">
                          {formatUsd(q.totalUsd)}
                        </TableCell>
                        <TableCell className="tabular-nums">
                          {formatUsd(q.depositUsd)}
                        </TableCell>
                        <TableCell>
                          <Badge variant={statusColors[q.status]}>
                            {statusLabels[q.status]}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-gray-500">
                          {new Date(q.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          {schedulingId === q.id ? (
                            <div className="flex flex-col gap-2 min-w-[200px]">
                              <Input
                                type="date"
                                value={scheduleDate}
                                onChange={(e) => setScheduleDate(e.target.value)}
                                className="h-8 text-sm"
                                placeholder="Install date"
                              />
                              <Input
                                value={scheduleInstaller}
                                onChange={(e) => setScheduleInstaller(e.target.value)}
                                className="h-8 text-sm"
                                placeholder="Installer name"
                              />
                              <div className="flex gap-1">
                                <Button size="sm" onClick={() => handleScheduleSubmit(q)} disabled={!scheduleDate || updatingId === q.id}>
                                  Save
                                </Button>
                                <Button size="sm" variant="ghost" onClick={() => setSchedulingId(null)}>
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          ) : nextStatuses.length > 0 ? (
                            <div className="flex gap-1 flex-wrap">
                              {nextStatuses.includes("deposit_paid") && (
                                <Button
                                  size="sm"
                                  variant="success"
                                  onClick={() => handleStatusChange(q, "deposit_paid")}
                                  disabled={updatingId === q.id}
                                >
                                  Deposit Paid
                                </Button>
                              )}
                              {nextStatuses.includes("fully_paid") && (
                                <Button
                                  size="sm"
                                  variant="success"
                                  onClick={() => handleStatusChange(q, "fully_paid")}
                                  disabled={updatingId === q.id}
                                >
                                  Full Paid
                                </Button>
                              )}
                              {nextStatuses.includes("installed") && (
                                <Button
                                  size="sm"
                                  variant="primary"
                                  onClick={() => {
                                    setSchedulingId(q.id);
                                    setScheduleDate(new Date().toISOString().split("T")[0]);
                                  }}
                                >
                                  <Calendar className="w-3.5 h-3.5" />
                                  Schedule
                                </Button>
                              )}
                              {nextStatuses.includes("cancelled") && (
                                <Button
                                  size="sm"
                                  variant="danger"
                                  onClick={() => handleStatusChange(q, "cancelled")}
                                  disabled={updatingId === q.id}
                                >
                                  Cancel
                                </Button>
                              )}
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400">No actions</span>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </>
    );
  }
}
