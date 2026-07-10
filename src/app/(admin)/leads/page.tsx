"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Download, Search, Filter, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SkeletonTable } from "@/components/ui/skeleton";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { subscribeToQuotes, getPackageById, updateQuote, createInstallSchedule } from "@/lib/db";
import { formatUsd } from "@/lib/utils";
import type { Quote, QuoteStatus } from "@/types";

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

export default function LeadsPage() {
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

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <Card className="border-0 shadow-sm bg-white">
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h1 className="text-xl font-bold text-primary">Leads</h1>
              <p className="text-sm text-gray-500 mt-0.5">
                {loading ? "Loading..." : `${filtered.length} lead${filtered.length !== 1 && "s"}`}
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
    </motion.div>
  );
}
