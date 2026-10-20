import { Link } from "react-router-dom";
import {
  AlertTriangle,
  ChevronRight,
  FlaskConical,
  Pencil,
  Plus,
  Rocket,
  XCircle,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { ActivityItem, ActivityKind } from "../page-data";

const kinds: Record<ActivityKind, { icon: LucideIcon; className: string }> = {
  created: { icon: Plus, className: "bg-gray-100 text-gray-600" },
  updated: { icon: Pencil, className: "bg-gray-100 text-gray-600" },
  tested: { icon: FlaskConical, className: "bg-gray-100 text-gray-600" },
  deployed: { icon: Rocket, className: "bg-gray-100 text-gray-600" },
  warning: { icon: AlertTriangle, className: "bg-amber-50 text-amber-600" },
  error: { icon: XCircle, className: "bg-red-50 text-red-600" },
};

interface Props {
  items: ActivityItem[];
  /** Shown instead of the list when there are no items. */
  emptyMessage?: string;
}

/** A bordered feed of events: recent activity, or problems that need attention. */
export default function ActivityList({ items, emptyMessage = "Nothing to show." }: Props) {
  if (items.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white px-4 py-6 text-center text-sm text-gray-400">
        {emptyMessage}
      </div>
    );
  }

  return (
    <ul className="divide-y divide-gray-100 overflow-hidden rounded-lg border border-gray-200 bg-white">
      {items.map((item) => {
        const { icon: Icon, className } = kinds[item.kind];
        const row = (
          <>
            <span
              className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ${className}`}
            >
              <Icon size={15} />
            </span>
            <p className="min-w-0 flex-1 text-sm text-gray-700">
              {item.parts.map((part, i) =>
                typeof part === "string" ? (
                  <span key={i}>{part}</span>
                ) : (
                  <strong key={i} className="font-semibold text-gray-900">
                    {part.strong}
                  </strong>
                )
              )}
            </p>
            <span className="flex-shrink-0 text-xs text-gray-400">{item.when}</span>
            {item.linkTo && (
              <ChevronRight size={14} className="flex-shrink-0 text-gray-300 group-hover:text-gray-500" />
            )}
          </>
        );
        return (
          <li key={item.id}>
            {item.linkTo ? (
              <Link
                to={item.linkTo}
                className="group flex items-center gap-3 px-4 py-3 hover:bg-gray-50"
              >
                {row}
              </Link>
            ) : (
              <div className="flex items-center gap-3 px-4 py-3">{row}</div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
