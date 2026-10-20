import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronsUpDown, GitCompare, LogOut, Settings, Wrench } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface Props {
  user: { firstName: string; lastName: string; email: string };
  /** The instance you're signed in to; its settings live under Instance Settings. */
  instance: { name: string; initials: string };
  /** Called when "Log out" is chosen. */
  onLogOut?: () => void;
  /** Start with the menu open (useful for stories and screenshots). */
  defaultOpen?: boolean;
}

function MenuItem({
  to,
  icon: Icon,
  label,
  onSelect,
}: {
  to: string;
  icon: LucideIcon;
  label: string;
  onSelect: () => void;
}) {
  return (
    <Link
      to={to}
      role="menuitem"
      onClick={onSelect}
      className="flex items-center gap-2.5 rounded-md px-2 py-1.5 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
    >
      <Icon size={16} className="flex-shrink-0 text-gray-500" />
      {label}
    </Link>
  );
}

/**
 * Account switcher pinned to the bottom of the sidebar. Shows who you are
 * and which instance you're in; opens upwards into your personal and instance
 * settings.
 */
export default function AccountMenu({ user, instance, onLogOut, defaultOpen = false }: Props) {
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
    <div ref={ref} className="relative">
      {open && (
        <div
          role="menu"
          data-ui="popover"
          className="absolute bottom-full left-0 right-0 mb-2 rounded-xl border border-gray-200 bg-white p-1.5 shadow-lg"
        >
          <p className="truncate px-2 pt-1 pb-1.5 text-xs text-gray-500">{user.email}</p>
          <MenuItem to="/user-settings" icon={Settings} label="Settings" onSelect={close} />
          <MenuItem
            to="/instance-settings"
            icon={Wrench}
            label="Instance Settings"
            onSelect={close}
          />
          <div className="my-1.5 border-t border-gray-200" />
          <MenuItem to="/ia-comparison" icon={GitCompare} label="IA Comparison" onSelect={close} />
          <div className="my-1.5 border-t border-gray-200" />
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              close();
              onLogOut?.();
            }}
            className="flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-left text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
          >
            <LogOut size={16} className="flex-shrink-0 text-gray-500" />
            Log out
          </button>
        </div>
      )}

      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        data-ui="account-trigger"
        onClick={() => setOpen((o) => !o)}
        className={`flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-left transition-colors ${
          open ? "bg-gray-100" : "hover:bg-gray-100"
        }`}
      >
        <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md bg-indigo-600 text-[11px] font-bold text-white">
          {instance.initials}
        </span>
        <span className="min-w-0 flex-1 truncate text-sm">
          <span className="font-medium text-gray-900">{user.firstName}</span>
          <span className="text-gray-500"> · {instance.name}</span>
        </span>
        <ChevronsUpDown size={14} className="flex-shrink-0 text-gray-400" />
      </button>
    </div>
  );
}
