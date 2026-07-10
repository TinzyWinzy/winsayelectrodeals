"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Save, Settings as SettingsIcon, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { SkeletonCard, SkeletonTable } from "@/components/ui/skeleton";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import {
  getAllPackagesAdmin,
  updatePackage,
  getRbzRate,
  setRbzRate,
} from "@/lib/db";
import { formatUsd } from "@/lib/utils";
import type { Package } from "@/types";

export default function SettingsPage() {
  const [packages, setPackages] = useState<Package[]>([]);
  const [zigRate, setZigRate] = useState(400);
  const [newRate, setNewRate] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [rateSaving, setRateSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [confirmDeactivate, setConfirmDeactivate] = useState<Package | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [pkgs, rate] = await Promise.all([
          getAllPackagesAdmin(),
          getRbzRate(),
        ]);
        setPackages(pkgs);
        if (rate) {
          setZigRate(rate.usdToZig);
          setNewRate(rate.usdToZig.toString());
        }
      } catch {
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleToggleActive = async (pkg: Package) => {
    if (pkg.active) {
      setConfirmDeactivate(pkg);
      return;
    }
    await doToggleActive(pkg);
  };

  const doToggleActive = async (pkg: Package) => {
    setConfirmDeactivate(null);
    setSaving(pkg.id);
    try {
      await updatePackage(pkg.id, { active: !pkg.active });
      setPackages((prev) =>
        prev.map((p) => (p.id === pkg.id ? { ...p, active: !p.active } : p))
      );
    } catch {
    } finally {
      setSaving(null);
    }
  };

  const handleUpdateRate = async () => {
    const rate = parseFloat(newRate);
    if (isNaN(rate) || rate <= 0) return;

    setRateSaving(true);
    try {
      await setRbzRate(rate);
      setZigRate(rate);
      setMessage("Rate updated successfully");
      setTimeout(() => setMessage(null), 3000);
    } catch {
      setMessage("Failed to update rate");
    } finally {
      setRateSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <SkeletonCard />
        <SkeletonTable rows={8} />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6 max-w-3xl"
    >
      <Card className="border-0 shadow-sm bg-white">
        <CardContent className="p-5">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <SettingsIcon className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-primary">Settings</h1>
              <p className="text-sm text-gray-500 mt-0.5">
                Manage packages, rates, and promotions
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm bg-white">
        <CardHeader className="px-5 py-4">
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-primary">RBZ Rate</h2>
          </div>
        </CardHeader>
        <CardContent className="p-5 pt-0 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
            <div className="w-full sm:w-auto">
              <Input
                label="USD to ZIG Rate"
                type="number"
                step="0.01"
                value={newRate}
                onChange={(e) => setNewRate(e.target.value)}
                className="max-w-[200px]"
              />
            </div>
            <Button
              variant="primary"
              onClick={handleUpdateRate}
              disabled={rateSaving}
            >
              {rateSaving ? (
                <Spinner size="sm" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              Update Rate
            </Button>
          </div>
          {message && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-sm text-success"
            >
              {message}
            </motion.p>
          )}
          <p className="text-xs text-gray-500">
            Current rate: 1 USD = {zigRate} ZIG. Updates automatically daily
            at 6 AM CAT via scheduled job.
          </p>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm bg-white">
        <CardHeader className="px-5 py-4">
          <h2 className="text-lg font-semibold text-primary">Packages</h2>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-hidden rounded-lg border border-gray-200 mx-5 mb-5">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>kVA</TableHead>
                  <TableHead>Price (USD)</TableHead>
                  <TableHead>Active</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {packages.map((pkg) => (
                  <TableRow key={pkg.id}>
                    <TableCell className="font-medium">{pkg.name}</TableCell>
                    <TableCell>{pkg.kvaRating}</TableCell>
                    <TableCell className="tabular-nums">
                      {formatUsd(pkg.basePriceUsd)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={pkg.active ? "success" : "outline"}>
                        {pkg.active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant={pkg.active ? "danger" : "success"}
                        onClick={() => handleToggleActive(pkg)}
                        disabled={saving === pkg.id}
                      >
                        {saving === pkg.id
                          ? "..."
                          : pkg.active
                          ? "Deactivate"
                          : "Activate"}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      {confirmDeactivate && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setConfirmDeactivate(null)}
        >
          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            className="bg-white rounded-xl shadow-xl p-6 max-w-sm w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-primary mb-2">Deactivate Package</h3>
            <p className="text-sm text-gray-500 mb-6">
              Are you sure you want to deactivate <strong>{confirmDeactivate.name}</strong>? It will no longer be visible to customers.
            </p>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setConfirmDeactivate(null)}>
                Cancel
              </Button>
              <Button
                variant="danger"
                className="flex-1"
                onClick={() => doToggleActive(confirmDeactivate)}
              >
                Deactivate
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
}
