import type { ReactNode } from "react";
import { cn } from "../utils/cn";

/**
 * A page's body (Lightning's `page_content`): an optional banner and header,
 * then a scrolling gray-100 content area.
 */
export function PageContent({
  header,
  banner,
  children,
}: {
  header?: ReactNode;
  banner?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="flex h-full w-full flex-col">
      {banner}
      {header}
      <div className="flex-auto bg-secondary-100 relative">
        <section
          id="inner_content"
          className="overflow-y-auto [scrollbar-gutter:stable_both-edges] absolute top-0 bottom-0 left-0 right-0"
        >
          {children}
        </section>
      </div>
    </div>
  );
}

/** Centred max-w-7xl column (Lightning's `centered`). */
export function Centered({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn("max-w-7xl mx-auto py-6 sm:px-6 lg:px-8", className)}>{children}</div>;
}
