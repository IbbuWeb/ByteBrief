import type { ButtonHTMLAttributes } from "react";
import { forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", disabled, children, ...props }, ref) => {
    const base =
      "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors disabled:opacity-50 disabled:pointer-events-none";
    const variants: Record<string, string> = {
      primary: "bg-indigo-600 text-white hover:bg-indigo-700",
      secondary: "bg-gray-200 text-gray-900 hover:bg-gray-300",
      ghost: "bg-transparent text-gray-700 hover:bg-gray-100",
      danger: "bg-red-600 text-white hover:bg-red-700",
    };
    return (
      <button
        ref={ref}
        className={`${base} ${variants[variant]} ${className ?? ""}`}
        disabled={disabled}
        {...props}
      >
        {children}
      </button>
    );
  }
);
