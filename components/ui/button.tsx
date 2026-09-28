import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
  {
    variants: {
      variant: {
        default: "bg-red-600 text-white hover:bg-red-700 shadow-sm hover:shadow-red-500/20",
        destructive: "bg-rose-700 text-white hover:bg-rose-800 shadow-sm",
        outline: "border border-slate-200 bg-white hover:bg-slate-50 hover:text-slate-900 text-slate-700 shadow-xs",
        secondary: "bg-rose-50 text-rose-800 hover:bg-rose-100/80 border border-rose-100",
        ghost: "hover:bg-slate-100 hover:text-slate-900 text-slate-700",
        link: "text-red-600 underline-offset-4 hover:underline",
        medical: "bg-gradient-to-r from-red-600 to-rose-600 text-white hover:from-red-700 hover:to-rose-700 shadow-md shadow-red-500/25",
        accent: "bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-12 rounded-xl px-7 text-base font-semibold",
        icon: "h-10 w-10 p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
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
