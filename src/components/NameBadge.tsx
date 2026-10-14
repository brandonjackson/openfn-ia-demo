import type { ReactNode } from "react";

/**
 * "Your project will be named `my-project`." (Lightning's `name_badge`,
 * components/pills.ex): the slugified name in a yellow mono chip. Renders
 * nothing while the name is empty.
 */
export default function NameBadge({ name, children }: { name: string; children?: ReactNode }) {
  if (name === "") return null;
  return (
    <span>
      {children}
      <span className="ml-1 rounded-md border border-slate-300 bg-yellow-100 p-1 font-mono text-xs">{name}</span>.
    </span>
  );
}
