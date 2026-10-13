import type { ButtonHTMLAttributes, ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "danger"
  | "dark"
  | "outline-primary"
  | "outline-danger"
  | "ghost"
  | "link-danger";

export type ButtonSize = "xs" | "sm" | "md";

const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-blue-600 text-white hover:bg-blue-700",
  secondary: "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50",
  danger: "bg-red-600 text-white hover:bg-red-700",
  dark: "bg-gray-900 text-white hover:bg-gray-800",
  "outline-primary": "border border-blue-300 text-blue-600 hover:bg-blue-50",
  "outline-danger": "border border-red-200 text-red-600 hover:bg-red-50",
  ghost: "text-gray-500 hover:bg-gray-100 hover:text-gray-700",
  "link-danger": "text-red-500 hover:text-red-700",
};

const sizeClasses: Record<ButtonSize, string> = {
  xs: "px-3 py-1 text-xs",
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-sm",
};

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: LucideIcon;
  children: ReactNode;
}

/**
 * The one button used across the app. Pick a variant for intent and a size
 * for context (`sm` for section header actions, `md` for form submits).
 */
export default function Button({
  variant = "primary",
  size = "md",
  icon: Icon,
  className = "",
  type = "button",
  children,
  ...rest
}: Props) {
  // Link-style buttons sit inline with text, so they skip padding.
  const sizing = variant === "link-danger" ? "text-xs" : sizeClasses[size];
  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center gap-1.5 rounded-md font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${variantClasses[variant]} ${sizing} ${className}`}
      {...rest}
    >
      {Icon && <Icon size={14} />}
      {children}
    </button>
  );
}
