import { cn } from "@/lib/utils";

interface SpinnerProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function Spinner({ className, size = "md" }: SpinnerProps) {
  const sizeMap = { sm: "w-4 h-4", md: "w-6 h-6", lg: "w-10 h-10" };

  return (
    <div
      className={cn(
        "animate-spin rounded-full border-[3px] border-gray-100 border-t-primary shadow-sm",
        sizeMap[size],
        className
      )}
      role="status"
      aria-label="Loading"
    />
  );
}
