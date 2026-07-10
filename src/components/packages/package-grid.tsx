"use client";

import { useState, useEffect } from "react";
import { PackageCard } from "./package-card";
import { Spinner } from "@/components/ui/spinner";
import { getPackages } from "@/lib/db";
import { cachePackageData, getCachedPackages } from "@/lib/offline";
import { fallbackPackages } from "@/lib/fallback-data";
import type { Package } from "@/types";

export function PackageGrid() {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [usingFallback, setUsingFallback] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        const cached = await getCachedPackages<Package[]>();
        if (cached && mounted) {
          setPackages(cached);
        }

        const allPackages = await getPackages();

        if (mounted) {
          if (allPackages.length > 0) {
            setPackages(allPackages);
            setUsingFallback(false);
            await cachePackageData(allPackages);
          } else {
            setPackages(fallbackPackages);
            setUsingFallback(true);
          }
        }
      } catch {
        if (mounted) {
          const cached = await getCachedPackages<Package[]>();
          if (cached) {
            setPackages(cached);
          } else {
            setPackages(fallbackPackages);
            setUsingFallback(true);
          }
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    load();
    return () => { mounted = false; };
  }, []);

  if (loading && packages.length === 0) {
    return (
      <div className="flex justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div>
      {usingFallback && (
        <div className="mb-6 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-700">
          Showing sample packages. Connect Supabase and run the seed script to load real data.
        </div>
      )}
      {packages.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <p>No packages available at the moment.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {packages.map((pkg, i) => (
            <PackageCard key={pkg.id} pkg={pkg} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
