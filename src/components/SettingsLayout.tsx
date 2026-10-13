import type { ReactNode } from "react";
import PageHeader from "./PageHeader";
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
      <PageHeader breadcrumbs={breadcrumbs} title={title} description={description} />

      <div className="mt-8 flex gap-8">
        <SettingsNav items={navItems} activeId={activeId} onSelect={onSelect} />
        <div className="flex-1 min-w-0">{children}</div>
      </div>
    </div>
  );
}
