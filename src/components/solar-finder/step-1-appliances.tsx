"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Lightbulb, Tv, Wifi, Smartphone, Laptop, Monitor,
  Refrigerator, Snowflake, Radio, Wind, Microwave,
  CookingPot, WashingMachine, Droplets, Camera,
  Printer, Store, Plug,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { appliances } from "@/lib/solar-finder/appliances";
import type { ApplianceSelection } from "@/types/solar-finder";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Lightbulb, Tv, Wifi, Smartphone, Laptop, Monitor,
  Refrigerator, Snowflake, Radio, Wind, Microwave,
  CookingPot, WashingMachine, Droplets, Camera,
  Printer, Store, Plug,
};

interface Step1AppliancesProps {
  selected: ApplianceSelection[];
  onSelect: (appliances: ApplianceSelection[]) => void;
  onNext: () => void;
}

export function Step1Appliances({ selected, onSelect, onNext }: Step1AppliancesProps) {
  const [localSelected, setLocalSelected] = useState<ApplianceSelection[]>(selected);

  const isSelected = useCallback(
    (id: string) => localSelected.some((s) => s.applianceId === id),
    [localSelected]
  );

  const getQuantity = useCallback(
    (id: string) => {
      const found = localSelected.find((s) => s.applianceId === id);
      return found?.quantity ?? 1;
    },
    [localSelected]
  );

  const toggleAppliance = (applianceId: string) => {
    if (isSelected(applianceId)) {
      setLocalSelected((prev) => prev.filter((s) => s.applianceId !== applianceId));
    } else {
      const appliance = appliances.find((a) => a.id === applianceId);
      setLocalSelected((prev) => [
        ...prev,
        { applianceId, quantity: appliance?.defaultQuantity || 1 },
      ]);
    }
  };

  const updateQuantity = (applianceId: string, quantity: number) => {
    setLocalSelected((prev) =>
      prev.map((s) =>
        s.applianceId === applianceId ? { ...s, quantity: Math.max(1, quantity) } : s
      )
    );
  };

  const handleNext = () => {
    onSelect(localSelected);
    onNext();
  };

  const canProceed = localSelected.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="text-center">
        <h2 className="text-2xl sm:text-3xl font-bold text-primary">
          What do you want to power?
        </h2>
        <p className="text-gray-500 mt-2 text-sm">
          Select everything you regularly want to use during power cuts.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {appliances.map((appliance) => {
          const Icon = iconMap[appliance.icon] || Plug;
          const selected_item = isSelected(appliance.id);
          const qty = getQuantity(appliance.id);

          return (
            <Card
              key={appliance.id}
              className={cn(
                "cursor-pointer transition-all duration-200 hover:shadow-md border-2",
                selected_item
                  ? "border-primary bg-primary/5 shadow-sm"
                  : "border-gray-200 hover:border-gray-300"
              )}
              onClick={() => toggleAppliance(appliance.id)}
            >
              <CardContent className="p-3 sm:p-4 flex flex-col items-center text-center gap-2">
                <div
                  className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center transition-colors",
                    selected_item ? "bg-primary text-white" : "bg-gray-100 text-gray-500"
                  )}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <span
                  className={cn(
                    "text-xs sm:text-sm font-medium leading-tight",
                    selected_item ? "text-primary" : "text-gray-700"
                  )}
                >
                  {appliance.name}
                </span>
                {selected_item && appliance.allowQuantity && (
                  <div className="flex items-center gap-1 mt-1" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      onClick={() => updateQuantity(appliance.id, qty - 1)}
                      className="w-7 h-7 rounded-md bg-gray-200 flex items-center justify-center text-sm font-medium hover:bg-gray-300 transition-colors"
                      aria-label={`Decrease ${appliance.name} quantity`}
                    >
                      -
                    </button>
                    <span className="text-sm font-bold text-primary w-6 text-center tabular-nums">
                      {qty}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(appliance.id, qty + 1)}
                      className="w-7 h-7 rounded-md bg-gray-200 flex items-center justify-center text-sm font-medium hover:bg-gray-300 transition-colors"
                      aria-label={`Increase ${appliance.name} quantity`}
                    >
                      +
                    </button>
                  </div>
                )}
                {selected_item && !appliance.allowQuantity && (
                  <span className="text-[10px] text-gray-400 font-medium">x{qty}</span>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <p className="text-xs text-gray-500">
          {localSelected.length > 0
            ? `${localSelected.length} appliance${localSelected.length > 1 ? "s" : ""} selected`
            : "Select at least one appliance"}
        </p>
        <Button onClick={handleNext} disabled={!canProceed}>
          Continue
        </Button>
      </div>
    </motion.div>
  );
}
