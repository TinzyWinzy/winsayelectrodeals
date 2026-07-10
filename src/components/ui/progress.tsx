import { cn } from "@/lib/utils";

interface ProgressProps {
  value: number;
  max?: number;
  className?: string;
  steps?: string[];
  currentStep?: number;
}

export function ProgressBar({
  value,
  max = 100,
  className,
}: ProgressProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  return (
    <div
      className={cn(
        "w-full h-2.5 bg-gray-100 rounded-full overflow-hidden shadow-inner",
        className
      )}
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
    >
      <div
        className="h-full bg-gradient-to-r from-primary to-primary-light transition-all duration-500 ease-out rounded-full shadow-sm"
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}

export function StepIndicator({
  steps,
  currentStep,
  className,
}: {
  steps: string[];
  currentStep: number;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      {steps.map((step, i) => {
        const stepNum = i + 1;
        const isActive = stepNum === currentStep;
        const isCompleted = stepNum < currentStep;

        return (
          <div key={step} className="flex items-center gap-2 flex-1">
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 shadow-sm",
                  isActive && "bg-primary text-white ring-2 ring-primary/20",
                  isCompleted && "bg-success text-white",
                  !isActive && !isCompleted && "bg-gray-200 text-gray-500"
                )}
              >
                {isCompleted ? (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  stepNum
                )}
              </div>
              <span
                className={cn(
                  "text-xs font-medium hidden sm:block transition-colors duration-200",
                  isActive && "text-primary font-semibold",
                  isCompleted && "text-success",
                  !isActive && !isCompleted && "text-gray-400"
                )}
              >
                {step}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className={cn(
                  "flex-1 h-0.5 rounded-full transition-colors duration-300",
                  isCompleted ? "bg-success" : "bg-gray-200"
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
