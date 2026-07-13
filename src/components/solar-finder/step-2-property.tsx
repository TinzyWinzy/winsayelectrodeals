"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { propertyTypeLabels } from "@/types/solar-finder";
import type { PropertyType } from "@/types/solar-finder";

interface Step2PropertyProps {
  propertyType: PropertyType | null;
  city: string;
  suburb: string;
  onPropertyTypeChange: (type: PropertyType) => void;
  onLocationChange: (data: { city: string; suburb: string }) => void;
  onNext: () => void;
  onBack: () => void;
}

const propertyIcons: Record<string, string> = {
  "1-2-room": "🏠",
  "3-4-room": "🏡",
  "5-plus-room": "🏘️",
  "large-family-home": "🏰",
  "apartment": "🏢",
  "farm": "🌾",
  "shop": "🏪",
  "office": "🏢",
  "school": "🏫",
  "lodge-guest-house": "🏨",
  "other-business": "💼",
};

export function Step2Property({
  propertyType,
  city,
  suburb,
  onPropertyTypeChange,
  onLocationChange,
  onNext,
  onBack,
}: Step2PropertyProps) {
  const canProceed = propertyType !== null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="text-center">
        <h2 className="text-2xl sm:text-3xl font-bold text-primary">
          What type of property are we powering?
        </h2>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {(Object.entries(propertyTypeLabels) as [PropertyType, string][]).map(
          ([value, label]) => (
            <Card
              key={value}
              className={cn(
                "cursor-pointer transition-all duration-200 hover:shadow-md border-2",
                propertyType === value
                  ? "border-primary bg-primary/5 shadow-sm"
                  : "border-gray-200 hover:border-gray-300"
              )}
              onClick={() => onPropertyTypeChange(value)}
            >
              <CardContent className="p-3 sm:p-4 flex flex-col items-center text-center gap-2">
                <span className="text-2xl">{propertyIcons[value] || "🏠"}</span>
                <span
                  className={cn(
                    "text-xs sm:text-sm font-medium leading-tight",
                    propertyType === value ? "text-primary" : "text-gray-700"
                  )}
                >
                  {label}
                </span>
              </CardContent>
            </Card>
          )
        )}
      </div>

      <div className="bg-gray-50 rounded-xl p-5 space-y-4 border border-gray-200">
        <h3 className="text-sm font-semibold text-primary">
          Where is the property located?
        </h3>
        <p className="text-xs text-gray-500">Optional but helps us serve you better.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="City / Town"
            placeholder="e.g. Harare"
            value={city}
            onChange={(e) => onLocationChange({ city: e.target.value, suburb })}
          />
          <Input
            label="Suburb / Area"
            placeholder="e.g. Borrowdale"
            value={suburb}
            onChange={(e) => onLocationChange({ city, suburb: e.target.value })}
          />
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button onClick={onNext} disabled={!canProceed}>
          Continue
        </Button>
      </div>
    </motion.div>
  );
}
