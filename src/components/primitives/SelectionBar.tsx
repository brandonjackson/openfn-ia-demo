import type { ReactNode } from "react";
import { X } from "lucide-react";
import IconButton from "./IconButton";

interface Props {
  /** How many are selected. The bar hides itself at none. */
  count: number;
  /** What's selected, singular, e.g. "work order". */
  noun: string;
  /** What can be done to the selection, usually Buttons. */
  children?: ReactNode;
  /** Clears the selection. */
  onClear: () => void;
}

/**
 * The bar over a list while some of its rows are picked: how many, what can
 * be done to them all at once, and a way to clear the selection.
 */
export default function SelectionBar({ count, noun, children, onClear }: Props) {
  if (count === 0) return null;
  return (
    <div
      role="toolbar"
      aria-label={`Actions for ${count} selected`}
      className="flex flex-wrap items-center gap-3 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-2"
    >
      <IconButton size="xs" icon={X} label="Clear selection" onClick={onClear} />
      <span className="text-sm font-medium text-indigo-900">
        {count} {noun}
        {count === 1 ? "" : "s"} selected
      </span>
      <div className="ml-auto flex flex-wrap items-center gap-2">{children}</div>
    </div>
  );
}
