import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "../../utils/cn";

export type EditorButtonVariant = "primary" | "danger" | "secondary" | "ghost" | "nakedClose";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: EditorButtonVariant;
  children?: ReactNode;
}

const base =
  "rounded-md px-3 py-2 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed";

const nakedCloseBase =
  "relative rounded-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed";

const variants: Record<EditorButtonVariant, string> = {
  primary:
    "bg-primary-600 hover:bg-primary-500 text-white shadow-xs focus-visible:outline-primary-600 disabled:bg-primary-300 disabled:hover:bg-primary-300",
  danger:
    "bg-red-600 hover:bg-red-500 text-white shadow-xs focus-visible:outline-red-600 disabled:bg-red-300 disabled:hover:bg-red-300",
  secondary:
    "bg-white text-gray-900 shadow-xs inset-ring inset-ring-gray-300 hover:inset-ring-gray-400 disabled:bg-gray-50 disabled:text-gray-400",
  ghost:
    "bg-transparent text-gray-700 hover:bg-gray-100 hover:text-gray-900 focus-visible:outline-gray-400 disabled:bg-transparent disabled:text-gray-400 disabled:hover:bg-transparent disabled:hover:text-gray-400",
  nakedClose: "text-gray-400 hover:text-gray-500 disabled:opacity-50",
};

/**
 * The collaborative editor's own button (collaborative-editor/components/
 * Button.tsx): primary / danger / secondary / ghost, plus `nakedClose`, the
 * bare X used in panel headers.
 */
export default function EditorButton({ variant = "primary", type = "button", className, children, ...rest }: Props) {
  return (
    <button
      type={type}
      className={cn(variant === "nakedClose" ? nakedCloseBase : base, variants[variant], className)}
      {...rest}
    >
      {variant === "nakedClose" ? (
        <>
          <span className="absolute -inset-2.5" />
          <span className="sr-only">{rest["aria-label"] || "Close panel"}</span>
          <div className="hero-x-mark size-6" />
        </>
      ) : (
        children
      )}
    </button>
  );
}
