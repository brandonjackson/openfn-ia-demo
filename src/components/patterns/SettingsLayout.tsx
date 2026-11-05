import type { ReactNode } from "react";
import PageHeader from "./PageHeader";
import SettingsNav from "./SettingsNav";
import type { SettingsNavItem } from "./SettingsNav";

interface Props {
  /** The trail above the title, e.g. the app's Breadcrumbs. */
  breadcrumbs: ReactNode;
  title: string;
  description?: string;
  navItems: SettingsNavItem[];
  activeId: string;
  onSelect?: (id: string) => void;
  children: ReactNode;
}

/**
 * Page frame shared by every settings page: breadcrumbs, title,
 * section menu on the left and the active section on the right. On small
 * screens the menu sits above the section instead.
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

      <div className="mt-8 flex flex-col gap-6 md:flex-row md:gap-8">
        <SettingsNav items={navItems} activeId={activeId} onSelect={onSelect} />
        <div className="flex-1 min-w-0">{children}</div>
      </div>
    </div>
  );
}
