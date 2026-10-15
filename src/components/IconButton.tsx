import type { ButtonHTMLAttributes, MouseEventHandler, ReactNode, Ref } from "react";
import { Link } from "react-router-dom";
import { cn } from "../utils/cn";

export type IconButtonSize = "sm" | "md" | "lg";

interface Props extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  /** Hero icon class, e.g. `hero-x-mark`, or an icon element of your own (an SVG). */
  icon: string | ReactNode;
  /** Accessible name, also shown as the hover tooltip. */
  label: string;
  size?: IconButtonSize;
  /** Highlights the button, e.g. a toggled panel. */
  active?: boolean;
  /** `danger` for destructive actions, e.g. a delete icon in a table row. */
  tone?: "default" | "danger";
  /** Render as a router link. Ignored while disabled. */
  to?: string;
  /** Render as a plain link. Ignored while disabled. */
  href?: string;
  /** Open the `href` link in a new tab. */
  external?: boolean;
  ref?: Ref<HTMLButtonElement>;
}

const sizes: Record<IconButtonSize, { button: string; icon: string }> = {
  sm: { button: "p-0.5", icon: "h-4 w-4" },
  md: { button: "p-1", icon: "h-5 w-5" },
  lg: { button: "p-1.5", icon: "h-6 w-6" },
};

const tones = {
  default: "text-gray-500 hover:bg-gray-100 hover:text-gray-700",
  danger: "text-red-600 hover:bg-red-50 hover:text-red-700",
};

/**
 * A square, borderless button showing only an icon: close buttons, panel
 * toggles, row actions. Always give it a `label`. Pass `to` or `href` for an
 * icon-only link that looks the same.
 */
export default function IconButton({
  icon,
  label,
  size = "md",
  active = false,
  tone = "default",
  to,
  href,
  external = false,
  className,
  type = "button",
  title,
  ref,
  ...rest
}: Props) {
  const s = sizes[size];
  const classes = cn(
    "inline-flex shrink-0 items-center justify-center rounded-md transition-colors cursor-pointer",
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600",
    "disabled:cursor-not-allowed disabled:opacity-50",
    active ? "bg-primary-50 text-primary-600" : tones[tone],
    s.button,
    className
  );
  const content = typeof icon === "string" ? <span className={cn(icon, s.icon)} aria-hidden="true" /> : icon;
  const common = { "aria-label": label, title: title ?? label, "data-ui": "icon-button", "data-variant": tone, className: classes, id: rest.id };

  if ((to || href) && !rest.disabled) {
    const onClick = rest.onClick as unknown as MouseEventHandler<HTMLAnchorElement> | undefined;
    return to ? (
      <Link to={to} onClick={onClick} {...common}>
        {content}
      </Link>
    ) : (
      <a href={href} onClick={onClick} {...(external && { target: "_blank", rel: "noopener noreferrer" })} {...common}>
        {content}
      </a>
    );
  }
  const button = (
    <button ref={ref} type={type} {...rest} {...common}>
      {content}
    </button>
  );
  // Disabled buttons don't get hover events in every browser, so the tooltip goes on a wrapper.
  return rest.disabled ? (
    <span title={common.title} className="inline-flex">
      {button}
    </span>
  ) : (
    button
  );
}
