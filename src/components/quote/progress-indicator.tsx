"use client";

import { motion } from "framer-motion";
import { StepIndicator } from "@/components/ui/progress";

const STEPS = [
  "Package",
  "Roof Type",
  "Location",
  "Photo",
  "Payment",
];

interface QuoteProgressProps {
  currentStep: number;
}

export function QuoteProgress({ currentStep }: QuoteProgressProps) {
  return (
    <div className="py-6">
      <StepIndicator steps={STEPS} currentStep={currentStep} />
      <motion.p
        key={currentStep}
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        className="text-sm text-gray-500 mt-3 text-center"
      >
        Step {currentStep} of {STEPS.length}: {STEPS[currentStep - 1]}
      </motion.p>
    </div>
  );
}
