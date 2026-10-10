import type { ReactNode } from "react";
import Breadcrumbs from "./Breadcrumbs";
import SettingsNav from "./SettingsNav";
import type { SettingsNavItem } from "./SettingsNav";

interface Props {
  breadcrumbs: { ancestors: { label: string; path: string }[]; current: string };
  title: string;
  description?: string;
  navItems: SettingsNavItem[];
  activeId: string;
  onSelect?: (id: string) => void;
  children: ReactNode;
}

/**
 * Page frame shared by every settings page: breadcrumbs, title,
 * section menu on the left and the active section on the right.
 */
export default function SettingsLayout({
  breadcrumbs,
  title,
  description,
  navItems,
  activeId,
  onSelect,
  children,
}: Props) {
  return (
    <div>
      <Breadcrumbs ancestors={breadcrumbs.ancestors} current={breadcrumbs.current} />

      <div className="mt-6 mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
        {description && <p className="mt-1 text-sm text-gray-500">{description}</p>}
      </div>

      <div className="flex gap-8">
        <SettingsNav items={navItems} activeId={activeId} onSelect={onSelect} />
        <div className="flex-1 min-w-0">{children}</div>
      </div>
    </div>
  );
}
