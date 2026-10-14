import type { ReactNode } from "react";
import Card from "../Card";
import Heading from "../Heading";

/**
 * A stat tile (DashboardComponents.metric_card): a small title, a big
 * number, then a suffix line with an optional link.
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
    <Card>
      <Heading as="h2" size="eyebrow" className="truncate">
        {title}
      </Heading>
      <div className="mt-2 text-3xl font-bold">{value}</div>
      {(suffix || link) && (
        <div className="mt-1 flex items-baseline justify-between gap-2 text-xs text-gray-500">
          <div>{suffix}</div>
          {link}
        </div>
      )}
    </Card>
  );
}
