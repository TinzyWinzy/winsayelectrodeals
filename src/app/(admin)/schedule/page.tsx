"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { SkeletonTable } from "@/components/ui/skeleton";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { getInstallSchedules, updateInstallSchedule, getAllQuotes } from "@/lib/db";
import type { InstallSchedule, InstallStatus, Quote } from "@/types";

const statusColors: Record<InstallStatus, "warning" | "success" | "primary" | "danger"> = {
  scheduled: "warning",
  in_progress: "primary",
  completed: "success",
  cancelled: "danger",
};

export default function SchedulePage() {
  const [schedules, setSchedules] = useState<InstallSchedule[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDate, setEditDate] = useState("");
  const [editInstaller, setEditInstaller] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const [s, q] = await Promise.all([
          getInstallSchedules(),
          getAllQuotes(),
        ]);
        setSchedules(s);
        setQuotes(q);
      } catch {
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleEdit = (schedule: InstallSchedule) => {
    setEditingId(schedule.id);
    setEditDate(schedule.installDate || "");
    setEditInstaller(schedule.installerName || "");
  };

  const handleSave = async () => {
    if (!editingId) return;
    try {
      await updateInstallSchedule(editingId, {
        installDate: editDate,
        installerName: editInstaller,
      } as Record<string, unknown>);
      setSchedules((prev) =>
        prev.map((s) =>
          s.id === editingId
            ? { ...s, installDate: editDate, installerName: editInstaller }
            : s
        )
      );
      setEditingId(null);
    } catch {}
  };

  const getQuoteForSchedule = (quoteId: string) =>
    quotes.find((q) => q.id === quoteId);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <Card className="border-0 shadow-sm bg-white">
        <CardContent className="p-5">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <CalendarIcon className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-primary">Install Schedule</h1>
              <p className="text-sm text-gray-500 mt-0.5">
                {loading ? "Loading..." : `${schedules.length} installation${schedules.length !== 1 && "s"}`}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <SkeletonTable rows={4} />
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Quote ID</TableHead>
                <TableHead>Installer</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {schedules.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-gray-400 py-12">
                    <div className="flex flex-col items-center gap-2">
                      <CalendarIcon className="w-5 h-5 text-gray-300" />
                      <p className="text-sm">No installations scheduled</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                schedules.map((schedule) => {
                  const quote = getQuoteForSchedule(schedule.quoteId);
                  const isEditing = editingId === schedule.id;

                  return (
                    <TableRow key={schedule.id}>
                      <TableCell className="font-mono text-xs font-medium">
                        {quote?.quoteId || schedule.quoteId.slice(0, 8)}
                      </TableCell>
                      <TableCell>
                        {isEditing ? (
                          <Input
                            value={editInstaller}
                            onChange={(e) => setEditInstaller(e.target.value)}
                            className="h-8 text-sm max-w-[160px]"
                          />
                        ) : (
                          schedule.installerName || (
                            <span className="text-gray-400 italic">Unassigned</span>
                          )
                        )}
                      </TableCell>
                      <TableCell>
                        {isEditing ? (
                          <Input
                            type="date"
                            value={editDate}
                            onChange={(e) => setEditDate(e.target.value)}
                            className="h-8 text-sm max-w-[140px]"
                          />
                        ) : schedule.installDate ? (
                          new Date(schedule.installDate).toLocaleDateString()
                        ) : (
                          <span className="text-gray-400 italic">Not set</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusColors[schedule.status]}>
                          {schedule.status === "in_progress" ? "In Progress" : schedule.status.charAt(0).toUpperCase() + schedule.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {isEditing ? (
                          <div className="flex gap-2">
                            <Button size="sm" onClick={handleSave}>
                              Save
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setEditingId(null)}
                            >
                              Cancel
                            </Button>
                          </div>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(schedule)}
                          >
                            Edit
                          </Button>
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
