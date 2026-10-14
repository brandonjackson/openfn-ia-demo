import type { ButtonHTMLAttributes, ReactNode, Ref } from "react";
import { Link } from "react-router-dom";
import { buttonClasses, type ButtonSize, type ButtonTheme } from "./buttonClasses";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  theme?: ButtonTheme;
  size?: ButtonSize;
  /** Render as a router link instead of a <button>. */
  to?: string;
  /** Render as a plain link (external pages, downloads, SSO handlers). */
  href?: string;
  /** Shown on hover (often why it's disabled). */
  tooltip?: string;
  ref?: Ref<HTMLButtonElement>;
  children: ReactNode;
}

/**
 * The button: rounded-md, text-sm font-semibold, shadow-xs, with primary /
 * secondary / danger / success / warning themes and sm / md / lg padding.
 * Pass `to` or `href` to get a link that looks the same.
 */
export default function Button({
  theme = "primary",
  size = "md",
  to,
  href,
  tooltip,
  disabled = false,
  className,
  type = "button",
  id,
  ref,
  children,
  ...rest
}: Props) {
  const classes = buttonClasses(theme, size, disabled, className);
  const shared = { id, className: classes, title: tooltip, "data-ui": "button", "data-variant": theme };
  if (to && !disabled) {
    return (
      <Link to={to} {...shared}>
        {children}
      </Link>
    );
  }
  if (href && !disabled) {
    return (
      <a href={href} {...shared}>
        {children}
      </a>
    );
  }
  return (
    <button ref={ref} type={type} disabled={disabled} {...shared} {...rest}>
      {children}
    </button>
  );
}
