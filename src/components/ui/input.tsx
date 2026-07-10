import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, error, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");
    const errorId = error ? `${inputId}-error` : undefined;

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-primary">
            {label}
          </label>
        )}
        <input
          type={type}
          id={inputId}
          aria-invalid={error ? "true" : undefined}
          aria-describedby={errorId}
          className={cn(
            "h-12 w-full px-4 rounded-lg border border-gray-300 bg-white text-primary placeholder:text-gray-400",
            "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:shadow-sm",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            "text-sm transition-all duration-200",
            error && "border-danger focus:ring-danger/20 focus:border-danger",
            className
          )}
          ref={ref}
          {...props}
        />
        {error && <p id={errorId} className="text-xs text-danger" role="alert">{error}</p>}
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };
