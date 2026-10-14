import type { ReactNode } from "react";
import { Link, type To } from "react-router-dom";
import { cn } from "../utils/cn";

export interface Tab<T extends string = string> {
  id: T;
  label: ReactNode;
  /** Hero icon class shown before the label. */
  icon?: string;
  /** Make the tab a route link (e.g. History's Work Orders / Channel Logs). */
  to?: To;
  disabled?: boolean;
  /** Tooltip on a disabled tab: why it can't be opened. */
  disabledReason?: string;
}

interface Props<T extends string> {
  tabs: Tab<T>[];
  active: T;
  /** Called when a tab is chosen. Route tabs navigate on their own unless this is set. */
  onChange?: (id: T) => void;
  /** `underline`: text over a rule. `pill`: segments on a gray track. */
  variant?: "underline" | "pill";
  orientation?: "horizontal" | "vertical";
  /** Pill tabs share the row's width equally. */
  fill?: boolean;
  /** Accessible name for the tab list. */
  label?: string;
  /** Extra controls at the end of the row, e.g. an add button. */
  after?: ReactNode;
  className?: string;
}

const styles = {
  underline: {
    list: "gap-4",
    tab: "border-b-2 px-1 py-2 text-sm font-medium leading-tight",
    selected: "border-primary-600 text-primary-600",
    idle: "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700",
  },
  pill: {
    list: "gap-1 rounded-lg bg-slate-100 p-1",
    tab: "rounded-md px-3 py-2 text-sm font-medium transition-all duration-200",
    selected: "bg-white text-primary-600 shadow-xs",
    idle: "text-gray-500 hover:bg-slate-50 hover:text-gray-700",
  },
};

/**
 * A row (or column) of tabs. Renders only the tabs; show the active panel
 * yourself.
 */
export default function Tabs<T extends string>({
  tabs,
  active,
  onChange,
  variant = "underline",
  orientation = "horizontal",
  fill = false,
  label,
  after,
  className,
}: Props<T>) {
  const s = styles[variant];
  const vertical = orientation === "vertical";
  const list = (
    <div
      role="tablist"
      aria-label={label}
      aria-orientation={orientation}
      className={cn("flex", vertical ? "flex-col" : "flex-row", s.list, variant === "pill" && after && "flex-1")}
    >
      {tabs.map((tab) => {
        const selected = tab.id === active;
        const classes = cn(
          "inline-flex items-center gap-2 whitespace-nowrap transition-colors cursor-pointer",
          "focus-visible:rounded-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600",
          s.tab,
          variant === "underline" && !vertical && "-mb-px",
          fill && "flex-1 justify-center",
          selected ? s.selected : s.idle,
          tab.disabled && "cursor-not-allowed opacity-50 hover:border-transparent hover:bg-transparent hover:text-gray-500"
        );
        const content = (
          <>
            {tab.icon && <span className={cn(tab.icon, "h-5 w-5 shrink-0")} aria-hidden="true" />}
            {tab.label}
          </>
        );
        const shared = {
          role: "tab",
          "aria-selected": selected,
          "aria-disabled": tab.disabled || undefined,
          title: tab.disabled ? tab.disabledReason : undefined,
          className: classes,
        };
        if (tab.to && !tab.disabled) {
          return (
            <Link
              key={tab.id}
              to={tab.to}
              {...shared}
              onClick={(e) => {
                if (!onChange) return;
                e.preventDefault();
                onChange(tab.id);
              }}
            >
              {content}
            </Link>
          );
        }
        return (
          <button key={tab.id} type="button" {...shared} disabled={tab.disabled} onClick={() => onChange?.(tab.id)}>
            {content}
          </button>
        );
      })}
    </div>
  );

  if (!after && variant === "pill") return <div className={className}>{list}</div>;
  return (
    <div
      className={cn(
        "flex",
        vertical ? "flex-col" : "items-center gap-x-4",
        variant === "underline" && !vertical && "border-b border-gray-200",
        className
      )}
    >
      {list}
      {after}
    </div>
  );
}
