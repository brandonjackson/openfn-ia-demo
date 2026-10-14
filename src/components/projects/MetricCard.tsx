import type { ReactNode } from "react";

/**
 * A stat tile above the workflows table (DashboardComponents.metric_card):
 * a small title, a big number, then a suffix line with an optional link.
 */
export default function MetricCard({
  title,
  value,
  suffix,
  link,
}: {
  title: string;
  value: ReactNode;
  suffix?: ReactNode;
  link?: ReactNode;
}) {
  return (
    <div className="bg-white rounded-lg ring-1 ring-gray-200 shadow-xs py-4 px-5">
      <h2 className="text-[13px] font-medium text-gray-500 truncate">{title}</h2>
      <div className="mt-2 text-3xl font-bold text-gray-800">{value}</div>
      <div className="mt-1 flex items-baseline justify-between gap-2 text-xs">
        <div className="text-gray-500">{suffix}</div>
        <div>{link}</div>
      </div>
    </div>
  );
}
