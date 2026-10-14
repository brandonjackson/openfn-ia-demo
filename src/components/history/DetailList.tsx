import type { ReactNode } from "react";
import { cn } from "../../utils/cn";

/** A divided key/value list (run_live/components.ex `detail_list`). */
export function DetailList({ id, className, children }: { id?: string; className?: string; children: ReactNode }) {
  return (
    <ul id={id} role="list" className={cn("flex-1 @5xl/viewer:flex-none", "divide-y divide-gray-200", className)}>
      {children}
    </ul>
  );
}

/** One row of a DetailList (`list_item`): label left, value right. */
export function DetailItem({ label, children }: { label: ReactNode; children?: ReactNode }) {
  return (
    <li className="px-0 py-2 xl:px-3 xl:py-3 2xl:px-4 2xl:py-4">
      <div className="flex justify-between items-baseline text-sm @md/viewer:text-base">
        <dt className="font-medium items-center">{label}</dt>
        <dd className="text-gray-900">{children}</dd>
      </div>
    </li>
  );
}
