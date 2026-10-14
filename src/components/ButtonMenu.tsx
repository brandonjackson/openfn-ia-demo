import type { ReactNode } from "react";
import Button, { type ButtonTheme } from "./Button";
import Menu from "./Menu";
import type { FloatingAlign } from "./floating";

interface Props {
  /** The button's text, e.g. "Actions". A chevron is added after it. */
  label: ReactNode;
  theme?: ButtonTheme;
  align?: FloatingAlign;
  /** Width class for the menu. */
  className?: string;
  /** MenuItems. */
  children: ReactNode;
}

/**
 * A labelled button with a chevron that opens a Menu: row "Actions" menus,
 * "Add new" menus (Lightning's `simple_dropdown`).
 */
export default function ButtonMenu({ label, theme = "secondary", align, className, children }: Props) {
  return (
    <Menu
      align={align}
      className={className}
      trigger={
        <Button theme={theme}>
          {label} <span className="hero-chevron-down h-4 w-4" />
        </Button>
      }
    >
      {children}
    </Menu>
  );
}
