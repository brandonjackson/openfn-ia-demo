import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

export interface Property {
  icon?: LucideIcon;
  label: string;
  value: ReactNode;
}

interface Props {
  properties: Property[];
  /**
   * `card` is the bordered list that summarises a record; `plain` is the
   * same label/value pairs as a bare two-column grid, aligned on one axis,
   * for a compact card such as the inspector.
   */
  variant?: "card" | "plain";
}

/** Label/value rows summarising a record: owner, URL, project, etc. */
export default function PropertyList({ properties, variant = "card" }: Props) {
  if (variant === "plain")
    return (
      <dl className="grid grid-cols-[76px_minmax(0,1fr)] items-center gap-x-3 gap-y-2.5">
        {properties.map(({ label, value }) => (
          <div key={label} className="contents">
            <dt className="text-xs text-gray-500">{label}</dt>
            <dd className="flex min-w-0 items-center gap-2 text-xs text-gray-900">{value}</dd>
          </div>
        ))}
      </dl>
    );
  return (
    <dl className="rounded-lg border border-gray-200 bg-white divide-y divide-gray-100">
      {properties.map(({ icon: Icon, label, value }) => (
        <div key={label} className="flex items-center gap-3 px-4 py-3">
          {Icon && <Icon size={14} className="flex-shrink-0 text-gray-400" />}
          <dt className="w-24 flex-shrink-0 text-sm text-gray-500">{label}</dt>
          <dd className="min-w-0 flex-1 truncate text-sm text-gray-900">{value}</dd>
        </div>
      ))}
    </dl>
  );
}
