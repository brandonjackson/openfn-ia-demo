import type { LucideIcon } from "lucide-react";

interface Props {
  icon: LucideIcon;
  /** Accessible name and tooltip, e.g. "Run history". */
  label: string;
  pressed?: boolean;
  onClick?: () => void;
  /** Extra tooltip text, e.g. a keyboard shortcut. */
  hint?: string;
  /** A small dot in the corner, e.g. when the tray has something new. */
  dot?: boolean;
  size?: "sm" | "md";
}

/**
 * A square icon button that stays "pressed" while what it opens is showing:
 * the editor's tray toggles (history, assistant, reference). The pressed
 * state is dark so it reads as the active one at a glance.
 */
export default function IconToggleButton({
  icon: Icon,
  label,
  pressed = false,
  onClick,
  hint,
  dot = false,
  size = "md",
}: Props) {
  const dims = size === "sm" ? "h-7 w-7" : "h-8 w-8";
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={pressed}
      aria-label={label}
      title={hint ? `${label} (${hint})` : label}
      className={`relative inline-flex ${dims} items-center justify-center rounded-md transition-colors ${
        pressed ? "bg-gray-900 text-white hover:bg-gray-800" : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
      }`}
    >
      <Icon size={size === "sm" ? 14 : 16} />
      {dot && <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-violet-500" aria-hidden />}
    </button>
  );
}
