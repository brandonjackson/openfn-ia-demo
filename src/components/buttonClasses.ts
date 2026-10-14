import { cn } from "../utils/cn";

export type ButtonTheme = "primary" | "secondary" | "danger" | "success" | "warning";
export type ButtonSize = "sm" | "md" | "lg";

const sizeClasses: Record<ButtonSize, string> = {
  sm: "px-2.5 py-1.5",
  md: "px-3 py-2",
  lg: "px-3.5 py-2.5",
};

// Lightning's new_inputs.ex button_theme_classes, enabled vs disabled.
const themeClasses: Record<ButtonTheme, { enabled: string; disabled: string }> = {
  primary: {
    enabled:
      "bg-primary-600 hover:bg-primary-500 text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600",
    disabled: "bg-primary-300 text-white",
  },
  secondary: {
    enabled: "bg-white hover:bg-gray-50 text-gray-900 ring-1 ring-gray-300 ring-inset",
    disabled: "bg-gray-50 text-gray-400 ring-1 ring-gray-200 ring-inset",
  },
  danger: {
    enabled:
      "bg-red-600 hover:bg-red-500 text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600",
    disabled: "bg-red-300 text-white",
  },
  success: {
    enabled:
      "bg-green-600 hover:bg-green-500 text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600",
    disabled: "bg-green-300 text-white",
  },
  warning: {
    enabled:
      "bg-yellow-600 hover:bg-yellow-500 text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow-600",
    disabled: "bg-yellow-300 text-white",
  },
};

export function buttonClasses(theme: ButtonTheme, size: ButtonSize = "md", disabled = false, className?: string) {
  return cn(
    "rounded-md text-sm font-semibold shadow-xs phx-submit-loading:opacity-75 inline-flex items-center justify-center gap-x-1.5",
    sizeClasses[size],
    themeClasses[theme][disabled ? "disabled" : "enabled"],
    disabled && "cursor-not-allowed",
    className
  );
}
