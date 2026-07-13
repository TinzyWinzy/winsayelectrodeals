"use client";

import { cn } from "@/lib/utils";

interface WizardProgressProps {
  currentStep: number;
  totalSteps: number;
}

export function WizardProgress({ currentStep, totalSteps }: WizardProgressProps) {
  return (
    <div className="flex items-center justify-center gap-3 mb-8">
      {Array.from({ length: totalSteps }, (_, i) => {
        const stepNum = i + 1;
        const isActive = stepNum === currentStep;
        const isCompleted = stepNum < currentStep;

        return (
          <div key={stepNum} className="flex items-center gap-3">
            <div
              className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 shadow-sm",
                isActive && "bg-primary text-white ring-2 ring-primary/20",
                isCompleted && "bg-success text-white",
                !isActive && !isCompleted && "bg-gray-200 text-gray-500"
              )}
            >
              {isCompleted ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                stepNum
              )}
            </div>
            {stepNum < totalSteps && (
              <div
                className={cn(
                  "w-10 sm:w-16 h-1 rounded-full transition-colors duration-300",
                  isCompleted ? "bg-success" : "bg-gray-200"
                )}
              />
            )}
          </div>
        );
      })}
      <span className="text-xs text-gray-500 ml-2 font-medium">
        Step {currentStep} of {totalSteps}
      </span>
    </div>
  );
}
