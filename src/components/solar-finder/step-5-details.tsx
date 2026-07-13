"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { timelineLabels, contactMethodLabels } from "@/types/solar-finder";
import type { ContactMethod, InstallationTimeline } from "@/types/solar-finder";

interface Step5DetailsProps {
  fullName: string;
  whatsappNumber: string;
  email: string;
  contactMethod: ContactMethod;
  installationTimeline: InstallationTimeline;
  isSubmitting: boolean;
  onChange: (data: {
    fullName: string;
    whatsappNumber: string;
    email: string;
    contactMethod: ContactMethod;
    installationTimeline: InstallationTimeline;
  }) => void;
  onSubmit: () => void;
  onBack: () => void;
}

export function Step5Details({
  fullName,
  whatsappNumber,
  email,
  contactMethod,
  installationTimeline,
  isSubmitting,
  onChange,
  onSubmit,
  onBack,
}: Step5DetailsProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!fullName.trim()) {
      newErrors.fullName = "Name is required";
    }

    if (!whatsappNumber.trim()) {
      newErrors.whatsappNumber = "WhatsApp number is required";
    } else if (!/^(\+?\d{7,15})$/.test(whatsappNumber.replace(/\s/g, ""))) {
      newErrors.whatsappNumber = "Enter a valid phone number";
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Enter a valid email address";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) {
      onSubmit();
    }
  };

  const update = (data: Partial<{
    fullName: string;
    whatsappNumber: string;
    email: string;
    contactMethod: ContactMethod;
    installationTimeline: InstallationTimeline;
  }>) => {
    onChange({
      fullName,
      whatsappNumber,
      email,
      contactMethod,
      installationTimeline,
      ...data,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="text-center">
        <h2 className="text-2xl sm:text-3xl font-bold text-primary">
          Almost done! Tell us about yourself
        </h2>
        <p className="text-gray-500 mt-2 text-sm">
          We&apos;ll send your recommendation straight to your phone.
        </p>
      </div>

      <div className="space-y-4 max-w-md mx-auto">
        <Input
          label="Full name"
          placeholder="e.g. Tendai Mukanya"
          value={fullName}
          onChange={(e) => update({ fullName: e.target.value })}
          error={errors.fullName}
          required
        />
        <Input
          label="WhatsApp number"
          placeholder="e.g. +263 785 293 587"
          value={whatsappNumber}
          onChange={(e) => update({ whatsappNumber: e.target.value })}
          error={errors.whatsappNumber}
          required
          type="tel"
        />
        <Input
          label="Email address (optional)"
          placeholder="e.g. tendai@example.com"
          value={email}
          onChange={(e) => update({ email: e.target.value })}
          error={errors.email}
          type="email"
        />
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-primary text-center">
          Preferred contact method
        </h3>
        <div className="flex justify-center gap-2 flex-wrap">
          {(Object.entries(contactMethodLabels) as [ContactMethod, string][]).map(
            ([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => update({ contactMethod: value })}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium border-2 transition-all",
                  contactMethod === value
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-gray-200 text-gray-600 hover:border-gray-300"
                )}
              >
                {label}
              </button>
            )
          )}
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-primary text-center">
          Installation timeline
        </h3>
        <div className="grid grid-cols-2 gap-2 max-w-md mx-auto">
          {(Object.entries(timelineLabels) as [InstallationTimeline, string][]).map(
            ([value, label]) => (
              <Card
                key={value}
                className={cn(
                  "cursor-pointer transition-all border-2",
                  installationTimeline === value
                    ? "border-primary bg-primary/5"
                    : "border-gray-200 hover:border-gray-300"
                )}
                onClick={() => update({ installationTimeline: value })}
              >
                <CardContent className="p-3 text-center">
                  <span
                    className={cn(
                      "text-xs font-medium",
                      installationTimeline === value ? "text-primary" : "text-gray-700"
                    )}
                  >
                    {label}
                  </span>
                </CardContent>
              </Card>
            )
          )}
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <Button variant="outline" onClick={onBack} disabled={isSubmitting}>
          Back
        </Button>
        <Button onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? "Finding your system..." : "Find My System"}
        </Button>
      </div>
    </motion.div>
  );
}
