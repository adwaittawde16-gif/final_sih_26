import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "md", ...props }, ref) => {
    const variants = {
      default: "bg-slate-900 hover:bg-slate-800 text-white shadow-sm border border-slate-900 font-semibold",
      outline: "bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-semibold",
      danger: "bg-red-600 hover:bg-red-700 text-white shadow-sm border border-red-700 font-semibold",
      ghost: "bg-transparent hover:bg-slate-100 text-slate-700"
    };

    const sizes = {
      sm: "px-3 py-1.5 text-xs font-mono rounded-md",
      md: "px-4 py-2 text-xs font-mono rounded-lg",
      lg: "px-6 py-3 text-sm font-mono rounded-lg"
    };

    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center transition-all focus:outline-none focus:ring-2 focus:ring-slate-900 disabled:opacity-50 disabled:pointer-events-none active:scale-95",
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
