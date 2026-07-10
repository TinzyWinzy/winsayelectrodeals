import { type HTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium shadow-sm",
  {
    variants: {
      variant: {
        primary: "bg-primary/10 text-primary",
        secondary: "bg-secondary text-white",
        success: "bg-success/10 text-green-700 border border-success/20",
        warning: "bg-warning/10 text-amber-700 border border-warning/20",
        danger: "bg-danger/10 text-red-700 border border-danger/20",
        outline: "border border-gray-300 text-gray-600",
      },
    },
    defaultVariants: {
      variant: "primary",
    },
  }
);

interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}
