import type { ReactNode } from "react";

/**
 * A short piece of code or an id inline in text, on a grey chip: a work
 * order id, a field name, a path. For a block of code use `CodeBlock`.
 */
export default function Code({ children }: { children: ReactNode }) {
  return <code className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-xs text-gray-700">{children}</code>;
}
