import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import type { StatTileData } from "../page-data";
import Badge from "./Badge";
import Sparkline from "./Sparkline";

interface Props extends StatTileData {
  /** Line colour for the sparkline, as a text colour class. */
  trendClassName?: string;
}

/**
 * A headline number with an optional status badge, supporting line and
 * sparkline. With `linkTo` the whole tile links to the page with the detail.
 */
export default function StatTile({
  label,
  value,
  detail,
  trend,
  badge,
  linkTo,
  trendClassName = "text-indigo-500",
}: Props) {
  const body = (
    <>
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm text-gray-500">{label}</p>
        {badge ? (
          <Badge label={badge.label} tone={badge.tone} />
        ) : (
          linkTo && (
            <ChevronRight
              size={14}
              className="text-gray-300 group-hover:text-gray-500 transition-colors"
            />
          )
        )}
      </div>
      <p className="mt-1 text-2xl font-semibold text-gray-900">{value}</p>
      {detail && <p className="mt-0.5 text-xs text-gray-500">{detail}</p>}
      {trend && (
        <Sparkline
          values={trend}
          label={`${label}, per day`}
          className={`mt-3 h-8 w-full ${trendClassName}`}
        />
      )}
    </>
  );

  const base = "block rounded-lg border border-gray-200 bg-white p-5";
  return linkTo ? (
    <Link to={linkTo} className={`group ${base} hover:border-gray-300 hover:shadow-sm transition`}>
      {body}
    </Link>
  ) : (
    <div className={base}>{body}</div>
  );
}
