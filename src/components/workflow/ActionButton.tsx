import type { ReactNode } from "react";
import { cn } from "../../utils/cn";

/** The black pill button used by the template and YAML import modals (ds/ActionButton.tsx). */
export default function ActionButton({
  children,
  onClick,
  disabled = false,
  className,
}: {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "inline-flex items-center gap-2 rounded-full bg-gray-900 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-gray-700",
        "focus:outline-none focus-visible:ring focus-visible:ring-gray-300 disabled:opacity-40 disabled:hover:bg-gray-900 disabled:cursor-not-allowed",
        className
      )}
    >
      {children}
    </button>
  );
}
