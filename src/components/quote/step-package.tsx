"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Check, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { getPackageById } from "@/lib/db";
import { formatUsd } from "@/lib/utils";
import type { Package } from "@/types";

interface StepPackageProps {
  packageId: string;
  onNext: (pkg: Package) => void;
}

export function StepPackage({ packageId, onNext }: StepPackageProps) {
  const [pkg, setPkg] = useState<Package | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await getPackageById(packageId);
        setPkg(data);
      } catch {
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [packageId]);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!pkg) {
    return (
      <div className="text-center py-12 text-gray-500">
        Package not found. Please go back and select a package.
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="border border-gray-200 rounded-md p-5">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-primary">{pkg.name}</h3>
            <div className="flex items-center gap-1.5 mt-1">
              <Zap className="w-4 h-4 text-warning" />
              <span className="text-sm font-semibold">{pkg.kvaRating} kVA</span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold tabular-nums text-primary">
              {formatUsd(pkg.basePriceUsd)}
            </p>
          </div>
        </div>

        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-success" />
            <span>{pkg.panelCount} x Solar Panels</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-success" />
            <span>{pkg.batterySpec}</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-success" />
            <span>{pkg.inverterBrand} Inverter</span>
          </div>
          {pkg.freeGift && (
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-success" />
              <span>Free {pkg.freeGift}</span>
            </div>
          )}
        </div>

        {pkg.payAfterInstallEligible && (
          <div className="mt-4 p-3 bg-primary/5 rounded-md border border-primary/10">
            <p className="text-sm font-medium text-primary">
              Pay After Install eligible
            </p>
            <p className="text-xs text-gray-500 mt-0.5">
              This package qualifies for our Pay After Installation plan.
            </p>
          </div>
        )}
      </div>

      <Button onClick={() => onNext(pkg)} size="lg" className="w-full">
        Continue
      </Button>
    </motion.div>
  );
}
