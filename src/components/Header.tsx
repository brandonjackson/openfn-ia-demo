import type { ReactNode } from "react";
import { cn } from "../utils/cn";

interface Props {
  /** Shown when there are no breadcrumbs. */
  title?: ReactNode;
  breadcrumbs?: ReactNode;
  /** Right-aligned content: buttons, the period picker, etc. */
  children?: ReactNode;
  /** Logged-out pages use the large title. */
  loggedOut?: boolean;
}

/**
 * The white bar across the top of every page (Lightning's
 * `LayoutComponents.header`): h-20, breadcrumbs or a title on the left,
 * actions on the right.
 */
export default function Header({ title, breadcrumbs, children, loggedOut = false }: Props) {
  return (
    <div className="flex-none bg-white shadow-xs border-b border-gray-200" data-ui="page-header" data-testid="top-bar">
      <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 py-6 flex items-center h-20">
        {breadcrumbs ?? (
          <h1
            className={cn(
              "text-gray-900 flex items-center",
              loggedOut ? "text-3xl font-bold" : "text-xl font-semibold"
            )}
          >
            {title}
          </h1>
        )}
        <div className="grow" />
        {children}
      </div>
    </div>
  );
}
