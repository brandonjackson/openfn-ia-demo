import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Check, ChevronDown } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface Props {
  /** Content of the trigger button, shown before the chevron. */
  trigger: ReactNode;
  /** Accessible name for the trigger. */
  label: string;
  /** Extra classes for the trigger, e.g. to tint it. */
  triggerClassName?: string;
  /** Start with the menu open (useful for stories and screenshots). */
  defaultOpen?: boolean;
  /** Menu body. Receives `close` so items can dismiss the menu. */
  children: (close: () => void) => ReactNode;
}

/**
 * Button that opens a menu below it. Closes on outside click or Escape.
 * Fill it with `DropdownMenuItem`, `DropdownMenuHeading` and
 * `DropdownMenuDivider`.
 */
export default function DropdownMenu({
  trigger,
  label,
  triggerClassName = "",
  defaultOpen = false,
  children,
}: Props) {
  const [open, setOpen] = useState(defaultOpen);
  const ref = useRef<HTMLDivElement>(null);
  const close = () => setOpen(false);

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative min-w-0">
      <button
        type="button"
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className={`flex max-w-full items-center gap-1.5 rounded-md px-2 py-1 text-sm font-medium text-gray-900 transition-colors ${
          open ? "bg-gray-100" : "hover:bg-gray-100"
        } ${triggerClassName}`}
      >
        <span className="flex min-w-0 items-center gap-1.5">{trigger}</span>
        <ChevronDown size={14} className="flex-shrink-0 text-gray-400" />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute left-0 top-full z-20 mt-1 w-80 max-w-[80vw] rounded-xl border border-gray-200 bg-white p-1.5 shadow-lg"
        >
          {children(close)}
        </div>
      )}
    </div>
  );
}

interface ItemProps {
  label: string;
  icon?: LucideIcon;
  /** Secondary text on the right, e.g. a timestamp. */
  meta?: string;
  /** Shows a check mark; the item reads as the current choice. */
  selected?: boolean;
  /** In-app route; renders a link. Otherwise a button calling `onSelect`. */
  to?: string;
  onSelect?: () => void;
}

export function DropdownMenuItem({ label, icon: Icon, meta, selected, to, onSelect }: ItemProps) {
  const className = `flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-left text-sm transition-colors ${
    selected ? "bg-gray-50 text-gray-900 font-medium" : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
  }`;
  const content = (
    <>
      {Icon && <Icon size={16} className="flex-shrink-0 text-gray-500" />}
      <span className="min-w-0 flex-1 truncate" title={label}>
        {label}
      </span>
      {meta && <span className="flex-shrink-0 text-xs text-gray-400">{meta}</span>}
      <Check size={14} className={`flex-shrink-0 ${selected ? "text-blue-600" : "invisible"}`} />
    </>
  );

  return to ? (
    <Link to={to} role="menuitem" onClick={onSelect} className={className}>
      {content}
    </Link>
  ) : (
    <button type="button" role="menuitem" onClick={onSelect} className={className}>
      {content}
    </button>
  );
}

export function DropdownMenuHeading({ children }: { children: ReactNode }) {
  return <p className="px-2 pt-1 pb-1.5 text-xs font-medium text-gray-500">{children}</p>;
}

export function DropdownMenuDivider() {
  return <div className="my-1.5 border-t border-gray-200" />;
}
