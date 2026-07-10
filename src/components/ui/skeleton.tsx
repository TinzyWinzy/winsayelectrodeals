import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
  variant?: "text" | "circular" | "rectangular" | "card";
}

export function Skeleton({ className, variant = "text" }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-gray-100",
        variant === "circular" && "rounded-full",
        variant === "card" && "rounded-lg border border-gray-100",
        className
      )}
    />
  );
}

export function SkeletonCard() {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5 space-y-4 shadow-sm">
      <Skeleton variant="text" className="h-5 w-2/3" />
      <Skeleton variant="text" className="h-4 w-1/2" />
      <div className="space-y-2">
        <Skeleton variant="text" className="h-4 w-full" />
        <Skeleton variant="text" className="h-4 w-3/4" />
        <Skeleton variant="text" className="h-4 w-5/6" />
      </div>
      <Skeleton variant="text" className="h-10 w-full rounded-lg" />
    </div>
  );
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden">
      <div className="p-4 border-b border-gray-100 bg-muted/50">
        <Skeleton variant="text" className="h-4 w-32" />
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 p-4 border-b border-gray-100 last:border-0"
        >
          <Skeleton variant="text" className="h-4 w-24" />
          <Skeleton variant="text" className="h-4 w-32 flex-1" />
          <Skeleton variant="text" className="h-4 w-20" />
          <Skeleton variant="text" className="h-6 w-16 rounded-full" />
          <Skeleton variant="text" className="h-4 w-16" />
        </div>
      ))}
    </div>
  );
}
