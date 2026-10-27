import type { ButtonHTMLAttributes, Ref } from "react";
import type { LucideIcon } from "lucide-react";

export type IconButtonSize = "xs" | "sm" | "md";

interface Props extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children" | "aria-label"> {
  icon: LucideIcon;
  /** Accessible name and tooltip, e.g. "Close panel". */
  label: string;
  /** Extra tooltip text, e.g. a keyboard shortcut. */
  hint?: string;
  /** `xs` 24px for dense rows, `sm` 28px for panel headers, `md` 32px for the toolbar and dialogs. */
  size?: IconButtonSize;
  /**
   * `ghost` (the default) is a quiet grey icon that lights up on hover: close,
   * collapse, ⋮. `toggle` stays dark while what it opens is showing.
   */
  variant?: "ghost" | "toggle";
  /** For `toggle`: whether it is on. Sets `aria-pressed`. */
  pressed?: boolean;
  /** For `ghost`: holds the hover look, e.g. while its menu is open. */
  active?: boolean;
  /** `accent` draws the active state in the brand colour, e.g. "something is attached". */
  tone?: "gray" | "accent";
  /** A small dot in the corner, e.g. when the tray has something new. */
  dot?: boolean;
  ref?: Ref<HTMLButtonElement>;
}

const dims: Record<IconButtonSize, { box: string; icon: number }> = {
  xs: { box: "h-6 w-6", icon: 13 },
  sm: { box: "h-7 w-7", icon: 15 },
  md: { box: "h-8 w-8", icon: 16 },
};

/**
 * A square button holding just an icon: every close, collapse, maximise, copy
 * and ⋮ in the app. The label is its accessible name and tooltip, so an icon
 * never goes unexplained.
 */
export default function IconButton({
  icon: Icon,
  label,
  hint,
  size = "sm",
  variant = "ghost",
  pressed,
  active = false,
  tone = "gray",
  dot = false,
  type = "button",
  title,
  ...rest
}: Props) {
  const { box, icon } = dims[size];
  const look =
    variant === "toggle"
      ? pressed
        ? "bg-gray-900 text-white hover:bg-gray-800"
        : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
      : active
        ? tone === "accent"
          ? "bg-indigo-50 text-indigo-600 hover:bg-indigo-100"
          : "bg-gray-100 text-gray-800"
        : "text-gray-400 hover:bg-gray-100 hover:text-gray-700";
  return (
    <button
      {...rest}
      type={type}
      aria-label={label}
      aria-pressed={variant === "toggle" ? !!pressed : rest["aria-pressed"]}
      title={title ?? (hint ? `${label} (${hint})` : label)}
      className={`relative inline-flex ${box} flex-shrink-0 items-center justify-center rounded-md transition-colors disabled:cursor-not-allowed disabled:bg-transparent disabled:text-gray-300 ${look}`}
    >
      <Icon size={icon} />
      {dot && <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-indigo-500" aria-hidden />}
    </button>
  );
}
