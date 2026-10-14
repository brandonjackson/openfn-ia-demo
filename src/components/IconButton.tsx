import type { ButtonHTMLAttributes, Ref } from "react";
import { cn } from "../utils/cn";

export type IconButtonSize = "sm" | "md" | "lg";

interface Props extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  /** Hero icon class, e.g. `hero-x-mark`. */
  icon: string;
  /** Accessible name, also shown as the hover tooltip. */
  label: string;
  size?: IconButtonSize;
  /** Highlights the button, e.g. a toggled panel. */
  active?: boolean;
  ref?: Ref<HTMLButtonElement>;
}

const sizes: Record<IconButtonSize, { button: string; icon: string }> = {
  sm: { button: "p-0.5", icon: "h-4 w-4" },
  md: { button: "p-1", icon: "h-5 w-5" },
  lg: { button: "p-1.5", icon: "h-6 w-6" },
};

/**
 * A square, borderless button showing only an icon: close buttons, panel
 * toggles, row actions. Always give it a `label`.
 */
export default function IconButton({ icon, label, size = "md", active = false, className, type = "button", title, ref, ...rest }: Props) {
  const s = sizes[size];
  return (
    <button
      ref={ref}
      type={type}
      aria-label={label}
      title={title ?? label}
      data-ui="icon-button"
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-md transition-colors cursor-pointer",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600",
        "disabled:cursor-not-allowed disabled:opacity-50",
        active ? "bg-primary-50 text-primary-600" : "text-gray-500 hover:bg-gray-100 hover:text-gray-700",
        s.button,
        className
      )}
      {...rest}
    >
      <span className={cn(icon, s.icon)} aria-hidden="true" />
    </button>
  );
}
