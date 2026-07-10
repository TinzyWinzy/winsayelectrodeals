"use client";

import { motion } from "framer-motion";
import { CheckCircle, Percent, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface StepPaymentTermsProps {
  payAfterInstall: boolean;
  canPayAfterInstall: boolean;
  onChange: (payAfter: boolean) => void;
  onBack: () => void;
  onSubmit: () => void;
  submitting: boolean;
}

export function StepPaymentTerms({
  payAfterInstall,
  canPayAfterInstall,
  onChange,
  onBack,
  onSubmit,
  submitting,
}: StepPaymentTermsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div>
        <h3 className="text-lg font-semibold text-primary mb-1">
          Payment Terms
        </h3>
        <p className="text-sm text-gray-500">
          Choose how you want to pay for your solar system.
        </p>
      </div>

      <div className="space-y-4">
        {canPayAfterInstall && (
          <button
            onClick={() => onChange(true)}
            className={cn(
              "w-full text-left p-5 rounded-xl border-2 transition-all duration-200 shadow-sm hover:shadow-md",
              payAfterInstall
                ? "border-primary bg-primary/5 shadow-primary/5"
                : "border-gray-200 hover:border-gray-300 bg-white"
            )}
          >
            <div className="flex items-start gap-4">
              <div
                className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors",
                  payAfterInstall ? "bg-primary text-white" : "bg-gray-100 text-gray-400"
                )}
              >
                <CheckCircle className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-primary">Pay AFTER Installation</p>
                <p className="text-sm text-gray-500 mt-1">
                  Pay a deposit upfront. The balance is due after your system is
                  installed and working. No interest charges.
                </p>
                <div className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-primary bg-primary/10 px-2.5 py-0.5 rounded-full">
                  <Percent className="w-3 h-3" />
                  Deposit required
                </div>
              </div>
            </div>
          </button>
        )}

        <button
          onClick={() => onChange(false)}
          className={cn(
            "w-full text-left p-5 rounded-xl border-2 transition-all duration-200 shadow-sm hover:shadow-md",
            !payAfterInstall
              ? "border-primary bg-primary/5 shadow-primary/5"
              : "border-gray-200 hover:border-gray-300 bg-white"
          )}
        >
          <div className="flex items-start gap-4">
            <div
              className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors",
                !payAfterInstall ? "bg-primary text-white" : "bg-gray-100 text-gray-400"
              )}
            >
              <CreditCard className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-primary">Full Prepay</p>
              <p className="text-sm text-gray-500 mt-1">
                Pay the full amount upfront and get a 5% discount.
              </p>
              {!payAfterInstall && (
                <div className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-success bg-success/10 px-2.5 py-0.5 rounded-full">
                  <Percent className="w-3 h-3" />
                  5% discount applied
                </div>
              )}
            </div>
          </div>
        </button>
      </div>

      <div className="flex gap-3 pt-2">
        <Button variant="outline" onClick={onBack} className="flex-1">
          Back
        </Button>
        <Button onClick={onSubmit} className="flex-1" disabled={submitting}>
          {submitting ? "Submitting..." : "Get My Quote"}
        </Button>
      </div>
    </motion.div>
  );
}
