import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

export interface Property {
  icon: LucideIcon;
  label: string;
  value: ReactNode;
}

interface Props {
  properties: Property[];
}

/** Bordered label/value rows summarising a record: owner, URL, project, etc. */
export default function PropertyList({ properties }: Props) {
  return (
    <dl className="rounded-lg border border-gray-200 bg-white divide-y divide-gray-100">
      {properties.map(({ icon: Icon, label, value }) => (
        <div key={label} className="flex items-center gap-3 px-4 py-3">
          <Icon size={14} className="flex-shrink-0 text-gray-400" />
          <dt className="w-24 flex-shrink-0 text-sm text-gray-500">{label}</dt>
          <dd className="min-w-0 flex-1 truncate text-sm text-gray-900">{value}</dd>
        </div>
      ))}
    </dl>
  );
}
