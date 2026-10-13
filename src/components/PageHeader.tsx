import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import Breadcrumbs from "./Breadcrumbs";

interface Props {
  /** Breadcrumbs shown above the title. */
  breadcrumbs?: { ancestors: { label: string; path: string }[]; current: string };
  title: ReactNode;
  description?: ReactNode;
  /** Icon tile shown before the title, for record pages (a system, a service). */
  icon?: LucideIcon;
  /** Badges shown after the title. */
  badges?: ReactNode;
  /** Buttons (or a badge) aligned to the right of the title. */
  actions?: ReactNode;
}

/**
 * Top of every page: breadcrumbs, the page title with an optional icon and
 * badges, a description, and page-level actions on the right.
 */
export default function PageHeader({ breadcrumbs, title, description, icon: Icon, badges, actions }: Props) {
  return (
    <div>
      {breadcrumbs && <Breadcrumbs ancestors={breadcrumbs.ancestors} current={breadcrumbs.current} />}
      <div className={`flex items-start justify-between gap-4 ${breadcrumbs ? "mt-6" : ""}`}>
        <div className="flex min-w-0 items-start gap-4">
          {Icon && (
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-gray-100">
              <Icon size={22} className="text-gray-400" />
            </div>
          )}
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
              {badges}
            </div>
            {description && <p className="mt-1 text-sm text-gray-500">{description}</p>}
          </div>
        </div>
        {actions && <div className="flex flex-shrink-0 items-center gap-2">{actions}</div>}
      </div>
    </div>
  );
}
