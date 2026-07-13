"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  backupDurationLabels,
  usagePatternLabels,
} from "@/types/solar-finder";
import type { BackupDuration, UsagePattern } from "@/types/solar-finder";

interface Step3BackupProps {
  backupDuration: BackupDuration | null;
  usagePattern: UsagePattern | null;
  onBackupDurationChange: (duration: BackupDuration) => void;
  onUsagePatternChange: (pattern: UsagePattern) => void;
  onNext: () => void;
  onBack: () => void;
}

export function Step3Backup({
  backupDuration,
  usagePattern,
  onBackupDurationChange,
  onUsagePatternChange,
  onNext,
  onBack,
}: Step3BackupProps) {
  const canProceed = backupDuration !== null && usagePattern !== null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="text-center">
        <h2 className="text-2xl sm:text-3xl font-bold text-primary">
          How long do you need backup power?
        </h2>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {(Object.entries(backupDurationLabels) as [BackupDuration, string][]).map(
          ([value, label]) => (
            <Card
              key={value}
              className={cn(
                "cursor-pointer transition-all duration-200 hover:shadow-md border-2",
                backupDuration === value
                  ? "border-primary bg-primary/5 shadow-sm"
                  : "border-gray-200 hover:border-gray-300"
              )}
              onClick={() => onBackupDurationChange(value)}
            >
              <CardContent className="p-3 sm:p-4 flex flex-col items-center text-center">
                <span
                  className={cn(
                    "text-xs sm:text-sm font-medium",
                    backupDuration === value ? "text-primary" : "text-gray-700"
                  )}
                >
                  {label}
                </span>
              </CardContent>
            </Card>
          )
        )}
      </div>

      <div className="pt-2">
        <div className="text-center mb-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-primary">
            When do you mainly need solar power?
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {(Object.entries(usagePatternLabels) as [UsagePattern, string][]).map(
            ([value, label]) => (
              <Card
                key={value}
                className={cn(
                  "cursor-pointer transition-all duration-200 hover:shadow-md border-2",
                  usagePattern === value
                    ? "border-primary bg-primary/5 shadow-sm"
                    : "border-gray-200 hover:border-gray-300"
                )}
                onClick={() => onUsagePatternChange(value)}
              >
                <CardContent className="p-3 sm:p-4 flex items-center gap-3">
                  <div
                    className={cn(
                      "w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0",
                      usagePattern === value
                        ? "border-primary"
                        : "border-gray-300"
                    )}
                  >
                    {usagePattern === value && (
                      <div className="w-2 h-2 rounded-full bg-primary" />
                    )}
                  </div>
                  <span
                    className={cn(
                      "text-sm font-medium",
                      usagePattern === value ? "text-primary" : "text-gray-700"
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
