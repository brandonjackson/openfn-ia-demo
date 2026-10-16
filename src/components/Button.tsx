import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode, Ref } from "react";
import { Link } from "react-router-dom";
import { cn } from "../utils/cn";
import Spinner from "./Spinner";

export type ButtonTheme = "primary" | "secondary" | "danger" | "success" | "warning";
export type ButtonSize = "xs" | "sm" | "md" | "lg";

const sizeClasses: Record<ButtonSize, string> = {
  xs: "px-2 py-1",
  sm: "px-2.5 py-1.5",
  md: "px-3 py-2",
  lg: "px-3.5 py-2.5",
};

// Lightning's new_inputs.ex button_theme_classes, enabled vs disabled.
const themeClasses: Record<ButtonTheme, { enabled: string; disabled: string }> = {
  primary: {
    enabled:
      "bg-primary-600 hover:bg-primary-500 text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600",
    disabled: "bg-primary-300 text-white",
  },
  secondary: {
    enabled: "bg-white hover:bg-gray-50 text-gray-900 ring-1 ring-gray-300 ring-inset",
    disabled: "bg-gray-50 text-gray-400 ring-1 ring-gray-200 ring-inset",
  },
  danger: {
    enabled:
      "bg-red-600 hover:bg-red-500 text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600",
    disabled: "bg-red-300 text-white",
  },
  success: {
    enabled:
      "bg-green-600 hover:bg-green-500 text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600",
    disabled: "bg-green-300 text-white",
  },
  warning: {
    enabled:
      "bg-yellow-600 hover:bg-yellow-500 text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow-600",
    disabled: "bg-yellow-300 text-white",
  },
};

function buttonClasses(theme: ButtonTheme, size: ButtonSize = "md", disabled = false, className?: string) {
  return cn(
    "rounded-md text-sm font-semibold shadow-xs phx-submit-loading:opacity-75 inline-flex items-center justify-center gap-x-1.5",
    sizeClasses[size],
    themeClasses[theme][disabled ? "disabled" : "enabled"],
    disabled && "cursor-not-allowed",
    className
  );
}

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  theme?: ButtonTheme;
  size?: ButtonSize;
  /** Render as a router link instead of a <button>. */
  to?: string;
  /** Render as a plain link (external pages, downloads, SSO handlers). */
  href?: string;
  /** Link-only: save the target instead of opening it. */
  download?: AnchorHTMLAttributes<HTMLAnchorElement>["download"];
  /** Link-only: e.g. `_blank`. */
  target?: string;
  rel?: string;
  /** Shown on hover (often why it's disabled). */
  tooltip?: string;
  /**
   * The action is in flight: the button is disabled and shows a spinner
   * before its label. Pass `useAction().pending` or let `FormModal` /
   * `ConfirmModal` manage it.
   */
  pending?: boolean;
  ref?: Ref<HTMLButtonElement>;
  children: ReactNode;
}

/**
 * The button: rounded-md, text-sm font-semibold, shadow-xs, with primary /
 * secondary / danger / success / warning themes and xs / sm / md / lg padding
 * (xs is the small row action in a table).
 * Pass `to` or `href` to get a link that looks the same. `pending` disables
 * it and shows a spinner while a request runs (STANDARDS.md pattern 1).
 */
export default function Button({
  theme = "primary",
  size = "md",
  to,
  href,
  tooltip,
  pending = false,
  disabled: disabledProp = false,
  className,
  type = "button",
  id,
  download,
  target,
  rel,
  ref,
  children,
  ...rest
}: Props) {
  const disabled = disabledProp || pending;
  const classes = buttonClasses(theme, size, disabled, className);
  const shared = {
    id,
    className: classes,
    title: tooltip,
    "data-ui": "button",
    "data-variant": theme,
    "data-pending": pending || undefined,
    "aria-busy": pending || undefined,
  };
  const content = (
    <>
      {pending && <Spinner size={size === "xs" ? "xs" : "sm"} label="Working" />}
      {children}
    </>
  );
  // Links take the same handlers and aria props as buttons.
  const link = { ...(rest as AnchorHTMLAttributes<HTMLAnchorElement>), ...shared, target, rel: rel ?? (target === "_blank" ? "noreferrer" : undefined) };
  if (to && !disabled) {
    return (
      <Link to={to} {...link}>
        {children}
      </Link>
    );
  }
  if (href && !disabled) {
    return (
      <a href={href} download={download} {...link}>
        {children}
      </a>
    );
  }
  const button = (
    <button ref={ref} type={type} disabled={disabled} {...shared} {...rest}>
      {content}
    </button>
  );
  // Disabled buttons don't get hover events in every browser, so the tooltip goes on a wrapper.
  return disabled && tooltip && !pending ? (
    <span title={tooltip} className="inline-flex">
      {button}
    </span>
  ) : (
    button
  );
}
