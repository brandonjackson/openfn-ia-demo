import type { LucideIcon } from "lucide-react";
import NavItem from "../primitives/NavItem";

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
 * Vertical section menu beside a page's content: settings pages, and
 * pickers that group their options (Connect a system). Each item is a
 * `NavItem` that links to a route or calls `onSelect`.
 */
export default function SettingsNav({ items, activeId, onSelect, ariaLabel = "Settings sections" }: Props) {
  return (
    <nav aria-label={ariaLabel} className="w-48 flex-shrink-0">
      <div className="space-y-0.5">
        {items.map((item) => (
          <NavItem
            key={item.id}
            variant="section"
            label={item.label}
            icon={item.icon}
            active={activeId === item.id}
            to={item.to}
            onClick={item.to ? undefined : () => onSelect?.(item.id)}
          />
        ))}
      </div>
    </nav>
  );
}
