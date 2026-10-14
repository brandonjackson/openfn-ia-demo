import type { ReactNode } from "react";
import { cn } from "../utils/cn";
import Heading from "./Heading";

/**
 * "Projects (1)" with its actions to the right: the title row above a
 * page-level table or list (Lightning's `table_title`). `className` sets the
 * spacing around it.
 */
export default function TableTitle({
  title,
  count,
  children,
  className,
}: {
  title: ReactNode;
  count?: number;
  /** Actions on the right, e.g. a search box and a create button. */
  children?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mb-3 flex items-center justify-between gap-2", className)}>
      <Heading size="xl">
        {title}
        {count !== undefined && <span className="text-base font-normal"> ({count})</span>}
      </Heading>
      {children && <div className="flex items-center gap-2">{children}</div>}
    </div>
  );
}
