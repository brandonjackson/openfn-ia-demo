import { Link } from "react-router-dom";
import type { LucideIcon } from "lucide-react";

export interface SettingsNavItem {
  id: string;
  label: string;
  icon: LucideIcon;
  /** When set, the item is a route link; otherwise it calls `onSelect`. */
  to?: string;
}

interface Props {
  items: SettingsNavItem[];
  activeId: string;
  onSelect?: (id: string) => void;
  ariaLabel?: string;
}

/**
 * Vertical section menu used on settings pages (project and user settings).
 */
export default function SettingsNav({ items, activeId, onSelect, ariaLabel = "Settings sections" }: Props) {
  return (
    <nav aria-label={ariaLabel} className="w-48 flex-shrink-0">
      <div className="space-y-0.5">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = activeId === item.id;
          const className = `w-full flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors text-left ${
            isActive
              ? "bg-blue-50 text-blue-700"
              : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
          }`;
          const content = (
            <>
              <Icon size={14} className={isActive ? "text-blue-500" : "text-gray-400"} />
              {item.label}
            </>
          );

          return item.to ? (
            <Link
              key={item.id}
              to={item.to}
              aria-current={isActive ? "page" : undefined}
              data-ui="nav-link"
              className={className}
            >
              {content}
            </Link>
          ) : (
            <button
              key={item.id}
              type="button"
              aria-current={isActive ? "page" : undefined}
              data-ui="nav-link"
              onClick={() => onSelect?.(item.id)}
              className={className}
            >
              {content}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
