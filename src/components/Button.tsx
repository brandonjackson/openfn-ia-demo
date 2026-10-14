import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Link } from "react-router-dom";
import { buttonClasses, type ButtonSize, type ButtonTheme } from "./buttonClasses";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  theme?: ButtonTheme;
  size?: ButtonSize;
  /** Render as a router link instead of a <button>. */
  to?: string;
  /** Shown on hover (Lightning shows a tooltip, often why it's disabled). */
  tooltip?: string;
  children: ReactNode;
}

/**
 * Lightning's `<.button>` (new_inputs.ex): rounded-md, text-sm
 * font-semibold, shadow-xs, with primary / secondary / danger / success /
 * warning themes and sm / md / lg padding.
 */
export default function Button({
  theme = "primary",
  size = "md",
  to,
  tooltip,
  disabled = false,
  className,
  type = "button",
  children,
  ...rest
}: Props) {
  const classes = buttonClasses(theme, size, disabled, className);
  if (to && !disabled) {
    return (
      <Link to={to} className={classes} title={tooltip} data-ui="button" data-variant={theme}>
        {children}
      </Link>
    );
  }
  return (
    <button
      type={type}
      disabled={disabled}
      title={tooltip}
      className={classes}
      data-ui="button"
      data-variant={theme}
      {...rest}
    >
      {children}
    </button>
  );
}
