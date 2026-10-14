import { createContext, useContext, type ReactNode } from "react";
import { cn } from "../utils/cn";

type Layout = "rows" | "grid";
const LayoutContext = createContext<Layout>("rows");

/**
 * Labelled values. `rows` (default) is a divided list with the label left
 * and the value right (run_live `detail_list`); `grid` puts small uppercase
 * labels above their values in columns.
 */
export function DetailList({
  layout = "rows",
  id,
  className,
  children,
}: {
  layout?: Layout;
  id?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <LayoutContext.Provider value={layout}>
      <dl
        id={id}
        className={cn(
          "text-sm",
          layout === "rows" ? "divide-y divide-gray-200" : "grid grid-cols-2 gap-4 md:grid-cols-4",
          className
        )}
      >
        {children}
      </dl>
    </LayoutContext.Provider>
  );
}

/** One label and its value. `mono` sets the value in the code font. */
export function DetailItem({
  label,
  mono = false,
  className,
  valueClassName,
  children,
}: {
  label: ReactNode;
  mono?: boolean;
  className?: string;
  /** Extra classes for the value, e.g. `break-all`. */
  valueClassName?: string;
  children?: ReactNode;
}) {
  const layout = useContext(LayoutContext);
  if (layout === "grid") {
    return (
      <div className={className}>
        <dt className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</dt>
        <dd className={cn("mt-1 break-words text-gray-900", mono && "font-mono text-xs", valueClassName)}>{children}</dd>
      </div>
    );
  }
  return (
    <div className={cn("flex items-center justify-between gap-4 py-2", className)}>
      <dt className="font-medium text-gray-600">{label}</dt>
      <dd className={cn("text-right text-gray-900", mono && "font-mono text-xs", valueClassName)}>{children}</dd>
    </div>
  );
}
