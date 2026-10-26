import { ChevronDown, FlaskConical, LayoutGrid, Plus } from "lucide-react";
import DropdownMenu from "../DropdownMenu";
import type { DropdownMenuItem } from "../DropdownMenu";

interface Props {
  /** Sandboxes of the project, "main" first. */
  sandboxes: string[];
  value: string;
  onChange?: (sandbox: string) => void;
  /** Whether main is live or paused; the chip reads that way on main. */
  live?: boolean;
  onNewSandbox?: () => void;
  onViewAll?: () => void;
  defaultOpen?: boolean;
}

/**
 * The chip after the workflow name that says where you are: on main it reads
 * "Live" (or "Paused") with a status dot, in a sandbox it shows the sandbox's
 * name in amber, truncating when the toolbar is tight. Clicking it lists the project's sandboxes to switch between,
 * with a way to start a new one or see them all.
 */
export default function SandboxChip({
  sandboxes,
  value,
  onChange,
  live = true,
  onNewSandbox,
  onViewAll,
  defaultOpen = false,
}: Props) {
  const onMain = value === "main";
  const items: DropdownMenuItem[] = [
    ...sandboxes.map((s) => ({
      id: `sandbox:${s}`,
      label: s,
      tag: s === "main" ? (live ? "Live" : "Paused") : undefined,
      description: s === "main" ? "Read-only" : undefined,
      selected: s === value,
    })),
    ...(onNewSandbox ? [{ id: "new", label: "New sandbox…", icon: Plus, divider: true }] : []),
    ...(onViewAll ? [{ id: "all", label: "View all sandboxes", icon: LayoutGrid, divider: !onNewSandbox }] : []),
  ];

  const select = (id: string) => {
    if (id === "new") onNewSandbox?.();
    else if (id === "all") onViewAll?.();
    else onChange?.(id.replace(/^sandbox:/, ""));
  };

  const trigger = onMain
    ? `inline-flex h-7 max-w-full items-center gap-1.5 rounded-full px-2.5 text-xs font-medium ${
        live ? "bg-green-50 text-green-800 hover:bg-green-100" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
      }`
    : "inline-flex h-7 max-w-full items-center gap-1.5 rounded-full bg-amber-50 px-2.5 font-mono text-xs text-amber-800 hover:bg-amber-100";

  return (
    <DropdownMenu
      ariaLabel="Switch sandbox"
      title="Sandboxes"
      items={items}
      onSelect={select}
      widthClass="w-64"
      defaultOpen={defaultOpen}
      shrink
      trigger={({ open, toggle }) => (
        <button
          type="button"
          onClick={toggle}
          aria-haspopup="menu"
          aria-expanded={open}
          title={onMain ? `main · ${live ? "live" : "paused"}` : `Sandbox ${value}`}
          className={trigger}
        >
          {onMain ? (
            <span className={`h-1.5 w-1.5 flex-none rounded-full ${live ? "bg-green-500" : "bg-gray-400"}`} aria-hidden />
          ) : (
            <FlaskConical size={12} className="flex-none text-amber-600" />
          )}
          <span className="min-w-0 max-w-[12rem] truncate">{onMain ? (live ? "Live" : "Paused") : value}</span>
          <ChevronDown size={12} className="flex-none opacity-60" />
        </button>
      )}
    />
  );
}
