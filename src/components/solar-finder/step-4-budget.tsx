"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { budgetLabels } from "@/types/solar-finder";
import type { BudgetRange } from "@/types/solar-finder";

interface Step4BudgetProps {
  budget: BudgetRange | null;
  onBudgetChange: (budget: BudgetRange) => void;
  onNext: () => void;
  onBack: () => void;
}

export function Step4Budget({
  budget,
  onBudgetChange,
  onNext,
  onBack,
}: Step4BudgetProps) {
  const canProceed = budget !== null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="text-center">
        <h2 className="text-2xl sm:text-3xl font-bold text-primary">
          What budget range are you working with?
        </h2>
        <p className="text-gray-500 mt-2 text-sm">
          Don&apos;t worry — we&apos;ll always recommend the safest system for your needs.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {(Object.entries(budgetLabels) as [BudgetRange, string][]).map(
          ([value, label]) => (
            <Card
              key={value}
              className={cn(
                "cursor-pointer transition-all duration-200 hover:shadow-md border-2",
                budget === value
                  ? "border-primary bg-primary/5 shadow-sm"
                  : "border-gray-200 hover:border-gray-300"
              )}
              onClick={() => onBudgetChange(value)}
            >
              <CardContent className="p-4 flex items-center gap-3">
                <div
                  className={cn(
                    "w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0",
                    budget === value ? "border-primary" : "border-gray-300"
                  )}
                >
                  {budget === value && (
                    <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                  )}
                </div>
                <span
                  className={cn(
                    "text-sm font-medium",
                    budget === value ? "text-primary" : "text-gray-700"
                  )}
                >
                  {label}
                </span>
              </CardContent>
            </Card>
          )
        )}
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
        <p className="text-xs text-amber-800 leading-relaxed">
          <strong>Important:</strong> Safety and technical suitability always take priority
          over budget. If your power needs require a larger system, we&apos;ll let you know
          and recommend speaking with the Winsay team.
        </p>
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
