import { useEffect, useRef, useState, type ReactNode } from "react";
import type { ButtonTheme } from "./buttonClasses";
import Button from "./Button";

interface Props {
  id?: string;
  /** Button label (Lightning's `:button` slot). */
  label: ReactNode;
  buttonTheme?: ButtonTheme;
  /** Menu entries: links or spans, each styled as a menu row. */
  children: ReactNode;
}

/**
 * Lightning's `Common.simple_dropdown` (live/components/common.ex): a button
 * with a chevron that opens a right-aligned w-56 menu. Clicking away or on
 * an entry closes it.
 */
export default function SimpleDropdown({ id, label, buttonTheme = "primary", children }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  return (
    <div id={id} ref={ref} className="relative inline-block">
      <div>
        <Button
          theme={buttonTheme}
          onClick={() => setOpen((o) => !o)}
          className="relative inline-flex items-center gap-x-0"
          aria-expanded={open}
          aria-haspopup="true"
        >
          {label}
          <span className="hero-chevron-down ml-1 h-5 w-5" />
        </Button>
      </div>
      {open && (
        <div
          className="absolute right-0 z-40 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black/5 focus:outline-none"
          role="menu"
          aria-orientation="vertical"
          tabIndex={-1}
          id={id && `${id}-menu`}
          onClick={() => setOpen(false)}
        >
          <div className="py-1 text-sm text-gray-700 *:block *:px-4 *:py-2 *:hover:bg-gray-100" role="none">
            {children}
          </div>
        </div>
      )}
    </div>
  );
}
