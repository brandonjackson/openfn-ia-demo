import type { ReactNode } from "react";

interface Props {
  /** The URL-safe name; nothing renders when it's empty. */
  name: string;
  children: ReactNode;
}

/**
 * Lightning's `name_badge` (components/pills.ex): "Your project will be
 * named `name`." with the name in a yellow monospace chip.
 */
export default function NameBadge({ name, children }: Props) {
  if (!name) return null;
  return (
    <span>
      {children}
      <span className="ml-1 rounded-md border border-slate-300 bg-yellow-100 p-1 font-mono text-xs">{name}</span>.
    </span>
  );
}
