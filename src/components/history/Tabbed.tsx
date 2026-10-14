import type { ReactNode } from "react";
import { cn } from "../../utils/cn";

export interface TabbedTab {
  id: string;
  label: ReactNode;
  disabled?: boolean;
  /** Tooltip shown on a disabled tab. */
  disabledMsg?: string;
}

/**
 * Lightning's horizontal tab container (live/components/tabbed.ex with the
 * `.tabbed-selector` and `.run-tab-container` styles): underlined tabs,
 * then the active panel. Lightning keys tabs on the URL hash; the demo's
 * hash router owns the hash, so the active tab is a prop here.
 */
export default function Tabbed({
  tabs,
  active,
  onChange,
  className,
  children,
}: {
  tabs: TabbedTab[];
  active: string;
  onChange: (id: string) => void;
  className?: string;
  /** The active panel. */
  children: ReactNode;
}) {
  return (
    <div className={cn("flex flex-col gap-x-4 gap-y-2 h-full", className)}>
      <div role="tablist" className="flex flex-row space-x-4 border-b border-gray-200 -m-1">
        {tabs.map((tab) => {
          const selected = tab.id === active;
          const classes = cn(
            "text-sm font-semibold py-2 px-1 border-b-2 border-transparent leading-tight",
            selected
              ? "border-b-primary-500 text-primary-600"
              : "text-gray-500 hover:text-gray-600 hover:border-b-gray-300",
            tab.disabled && "hover:cursor-not-allowed"
          );
          return tab.disabled ? (
            <span key={tab.id} role="tab" aria-selected={false} data-disabled title={tab.disabledMsg} className={classes}>
              {tab.label}
            </span>
          ) : (
            <a
              key={tab.id}
              role="tab"
              aria-selected={selected}
              href="#"
              className={classes}
              onClick={(e) => {
                e.preventDefault();
                onChange(tab.id);
              }}
            >
              {tab.label}
            </a>
          );
        })}
      </div>
      {children}
    </div>
  );
}
