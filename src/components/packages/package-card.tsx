"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ChevronRight, Check, Wifi, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatUsd } from "@/lib/utils";
import { getPackageImage } from "@/lib/fallback-data";
import type { Package } from "@/types";

interface PackageCardProps {
  pkg: Package;
  index: number;
}

export function PackageCard({ pkg, index }: PackageCardProps) {
  const isPopular = pkg.kvaRating === 3.5;
  const displaySpecs = pkg.specs && pkg.specs.length > 0 ? pkg.specs : [
    `${pkg.panelCount} x 700W solar panels`,
    pkg.batterySpec,
    `${pkg.kvaRating}Kva hybrid inverter`,
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4 }}
    >
      <Card
        className={`relative h-full flex flex-col overflow-hidden transition-all duration-300 group hover:shadow-xl hover:-translate-y-1 ${
          isPopular ? "border-secondary/30 ring-1 ring-secondary/10" : ""
        }`}
      >
        {isPopular && (
          <div className="absolute top-0 right-0 z-10">
            <div className="bg-gradient-to-l from-secondary to-red-600 text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg shadow-sm flex items-center gap-1">
              <Star className="w-3 h-3" />
              Most Popular
            </div>
          </div>
        )}

        <div className="relative h-36 bg-gray-100 overflow-hidden">
          <Image
            src={getPackageImage(pkg.kvaRating)}
            alt={`${pkg.kvaRating}Kva solar system`}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
          <div className="absolute bottom-2 left-3">
            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/90 backdrop-blur-sm text-[10px] font-bold text-primary">
              {pkg.kvaRating}Kva
            </div>
          </div>
        </div>

        <CardContent className="p-4 flex flex-col flex-1">
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-base font-bold text-primary">{pkg.name}</h3>
            {pkg.badge && (
              <Badge variant="secondary" className="text-[10px] whitespace-nowrap ml-2">
                {pkg.badge}
              </Badge>
            )}
          </div>

          {pkg.brands && (
            <p className="text-[10px] text-gray-400 mb-3">
              Brands: {pkg.brands}
            </p>
          )}

          <div className="space-y-1.5 mb-4">
            {displaySpecs.map((spec, i) => (
              <div key={i} className="flex items-start gap-2 text-sm text-gray-600">
                <Check className={`w-4 h-4 mt-0.5 shrink-0 ${spec.toLowerCase().includes("free install") ? "text-success" : "text-primary"}`} />
                <span>{spec}</span>
              </div>
            ))}
          </div>

          <div className="mt-auto space-y-3">
            <div className="bg-secondary rounded-lg p-3 text-center shadow-sm">
              <div className="flex items-baseline justify-center gap-1.5">
                <span className="text-2xl font-bold text-white tabular-nums">
                  {formatUsd(pkg.basePriceUsd)}
                </span>
                <span className="text-xs text-white/70 font-medium">USD</span>
              </div>
              {pkg.wifiEnabled && (
                <div className="mt-1 inline-flex items-center gap-1 text-[10px] text-white/80">
                  <Wifi className="w-3 h-3" />
                  WiFi-enabled monitoring
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-1">
              {pkg.freeGift && (
                <Badge variant="success" className="flex items-center gap-1 text-[10px]">
                  <Check className="w-3 h-3" />
                  {pkg.freeGift}
                </Badge>
              )}
              {pkg.wifiEnabled && (
                <Badge variant="primary" className="flex items-center gap-1 text-[10px]">
                  <Wifi className="w-3 h-3" />
                  WiFi
                </Badge>
              )}
            </div>

            <Link href={`/quote?package=${pkg.id}`} className="block">
              <Button variant="primary" size="sm" className="w-full group/btn">
                Get Free Quote
                <ChevronRight className="w-4 h-4 transition-transform duration-200 group-hover/btn:translate-x-0.5" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
