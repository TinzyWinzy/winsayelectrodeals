"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { provinces, citiesByProvince } from "@/types";

interface StepLocationProps {
  province: string;
  city: string;
  suburb: string;
  onProvinceChange: (v: string) => void;
  onCityChange: (v: string) => void;
  onSuburbChange: (v: string) => void;
  onBack: () => void;
  onNext: () => void;
}

export function StepLocation({
  province,
  city,
  suburb,
  onProvinceChange,
  onCityChange,
  onSuburbChange,
  onBack,
  onNext,
}: StepLocationProps) {
  const cities = province ? citiesByProvince[province] || [] : [];
  const canProceed = province && city && suburb.length >= 2;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-5"
    >
      <div>
        <h3 className="text-lg font-semibold text-primary mb-1">Location</h3>
        <p className="text-sm text-gray-500">
          Where is the installation site?
        </p>
      </div>

      <div className="bg-primary/5 rounded-lg p-4 border border-primary/10">
        <p className="text-xs text-primary/70">
          Your location helps us estimate travel time and installation logistics.
        </p>
      </div>

      <Select
        label="Province"
        placeholder="Select province"
        options={provinces.map((p) => ({ value: p, label: p }))}
        value={province}
        onChange={(e) => {
          onProvinceChange(e.target.value);
          onCityChange("");
        }}
      />

      <Select
        label="City / Town"
        placeholder="Select city"
        options={cities.map((c) => ({ value: c, label: c }))}
        value={city}
        onChange={(e) => onCityChange(e.target.value)}
        disabled={!province}
      />

      <Input
        label="Suburb"
        placeholder="Enter your suburb"
        value={suburb}
        onChange={(e) => onSuburbChange(e.target.value)}
      />

      <div className="flex gap-3">
        <Button variant="outline" onClick={onBack} className="flex-1">
          Back
        </Button>
        <Button onClick={onNext} className="flex-1" disabled={!canProceed}>
          Continue
        </Button>
      </div>
    </motion.div>
  );
}
