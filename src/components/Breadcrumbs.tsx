import type { ReactNode } from "react";
import { Link } from "react-router-dom";

/**
 * Breadcrumb trail for the page header (Lightning's `breadcrumbs`,
 * `breadcrumb_items` and `breadcrumb`). Separators show between crumbs only.
 */
export function Breadcrumbs({ children }: { children: ReactNode }) {
  return (
    <nav className="flex" aria-label="Breadcrumbs">
      <ol
        role="list"
        className="flex items-center space-x-2 [&>li.breadcrumb-item_.breadcrumb-separator]:hidden [&>li.breadcrumb-item+li.breadcrumb-item_.breadcrumb-separator]:flex"
      >
        {children}
      </ol>
    </nav>
  );
}

export function Breadcrumb({ to, children }: { to?: string; children: ReactNode }) {
  return (
    <li className="breadcrumb-item">
      <div className="flex items-center">
        <span className="hero-chevron-right breadcrumb-separator mr-1 h-5 w-5 shrink-0 text-gray-400" />
        {to ? (
          <Link to={to} className="ml-1 flex text-sm font-medium text-gray-500 hover:text-gray-700">
            {children}
          </Link>
        ) : (
          <span className="ml-1 flex items-center text-sm font-medium text-gray-500">{children}</span>
        )}
      </div>
    </li>
  );
}

/** Wraps a picker button as the first crumb (`breadcrumb_project_picker`). */
export function BreadcrumbPicker({ children }: { children: ReactNode }) {
  return <li className="mr-3">{children}</li>;
}
