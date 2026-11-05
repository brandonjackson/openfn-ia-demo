import type { ReactNode } from "react";

interface Props {
  /** Small grey heading. Leave out for an unlabelled group. */
  label?: string;
  children: ReactNode;
}

/** A group of sidebar links under an optional small grey heading. */
export default function SidebarSection({ label, children }: Props) {
  return (
    <div>
      {label && (
        <h2 data-ui="sidebar-heading" className="px-2 pb-1 text-xs font-medium text-gray-400">{label}</h2>
      )}
      <div className="space-y-0.5">{children}</div>
    </div>
  );
}
