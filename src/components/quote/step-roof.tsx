"use client";

import { motion } from "framer-motion";
import { Home, Building, Grid3X3, Mountain } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { RoofType } from "@/types";
import { roofTypeLabels } from "@/types";

const roofIcons: Record<RoofType, typeof Home> = {
  tile: Home,
  corrugated: Grid3X3,
  flat: Building,
  ground: Mountain,
};

interface StepRoofProps {
  selected: RoofType | null;
  onSelect: (type: RoofType) => void;
  onBack: () => void;
  onNext: () => void;
}

const roofOptions: RoofType[] = ["tile", "corrugated", "flat", "ground"];

export function StepRoof({ selected, onSelect, onBack, onNext }: StepRoofProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div>
        <h3 className="text-lg font-semibold text-primary mb-1">Roof Type</h3>
        <p className="text-sm text-gray-500">
          Select your roof type to calculate installation requirements.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4" role="radiogroup" aria-label="Roof type">
        {roofOptions.map((type) => {
          const Icon = roofIcons[type];
          const isSelected = selected === type;
          return (
            <button
              key={type}
              onClick={() => onSelect(type)}
              role="radio"
              aria-checked={isSelected}
              className={cn(
                "flex flex-col items-center justify-center gap-3 p-6 rounded-xl border-2 transition-all duration-200 shadow-sm hover:shadow-md",
                isSelected
                  ? "border-primary bg-primary/5 shadow-primary/5"
                  : "border-gray-200 hover:border-gray-300 bg-white"
              )}
            >
              <div
                className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center transition-colors duration-200",
                  isSelected ? "bg-primary text-white" : "bg-gray-100 text-gray-400"
                )}
              >
                <Icon className="w-6 h-6" />
              </div>
              <span
                className={cn(
                  "text-sm font-medium",
                  isSelected ? "text-primary" : "text-gray-600"
                )}
              >
                {roofTypeLabels[type]}
              </span>
            </button>
          );
        })}
      </div>

      <div className="flex gap-3 pt-2">
        <Button variant="outline" onClick={onBack} className="flex-1">
          Back
        </Button>
        <Button onClick={onNext} className="flex-1" disabled={!selected}>
          Continue
        </Button>
      </div>
    </motion.div>
  );
}
