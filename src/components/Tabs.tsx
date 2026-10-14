import type { ReactNode } from "react";
import { cn } from "../utils/cn";

export interface Tab<T extends string = string> {
  id: T;
  label: ReactNode;
}

interface Props<T extends string> {
  tabs: Tab<T>[];
  active: T;
  onChange: (id: T) => void;
  /** Accessible name for the tab list. */
  label?: string;
  /** Extra controls at the end of the row, e.g. an add button. */
  after?: ReactNode;
  className?: string;
}

/**
 * Text tabs over a gray rule, with a primary underline on the active one
 * (Lightning's `tabbed-selector`). Renders only the tab row; show the
 * active panel yourself.
 */
export default function Tabs<T extends string>({ tabs, active, onChange, label, after, className }: Props<T>) {
  return (
    <div className={cn("flex items-center gap-x-4 border-b border-gray-200", className)}>
      <div role="tablist" aria-label={label} className="flex gap-x-4">
        {tabs.map((tab) => {
          const selected = tab.id === active;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => onChange(tab.id)}
              className={cn(
                "-mb-px whitespace-nowrap border-b-2 px-1 py-2 text-sm font-medium transition-colors cursor-pointer",
                "focus-visible:rounded-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600",
                selected
                  ? "border-primary-600 text-primary-600"
                  : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
              )}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
      {after}
    </div>
  );
}
