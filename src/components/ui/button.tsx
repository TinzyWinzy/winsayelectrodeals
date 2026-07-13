import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed min-h-[48px] px-6 text-sm rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60 focus-visible:ring-offset-2",
  {
    variants: {
      variant: {
        primary:
          "bg-primary text-white shadow-[0_12px_28px_rgb(5_4_95/0.22)] hover:shadow-[0_16px_38px_rgb(5_4_95/0.28)] hover:bg-primary-light active:scale-[0.98] active:bg-primary",
        secondary:
          "bg-secondary text-white shadow-[0_12px_28px_rgb(192_0_18/0.22)] hover:shadow-[0_16px_38px_rgb(192_0_18/0.28)] hover:bg-secondary-light active:scale-[0.98] active:bg-secondary",
        premium:
          "bg-ink text-white border border-gold/40 shadow-[0_16px_42px_rgb(7_9_26/0.25)] hover:bg-primary hover:border-gold-light active:scale-[0.98]",
        outline:
          "border border-gray-300 text-primary bg-white hover:bg-gray-50 hover:border-gray-400 active:bg-gray-100",
        ghost: "text-primary hover:bg-gray-100 active:bg-gray-200",
        danger: "bg-danger text-white shadow-sm hover:shadow-md hover:bg-red-600 active:scale-[0.98] active:bg-red-700",
        success: "bg-success text-white shadow-sm hover:shadow-md hover:bg-green-600 active:scale-[0.98] active:bg-green-700",
      },
      size: {
        sm: "h-10 px-4 text-xs",
        md: "h-12 px-6 text-sm",
        lg: "h-14 px-8 text-base",
        icon: "h-12 w-12 p-0",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
