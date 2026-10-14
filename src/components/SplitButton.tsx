import type { ReactNode } from "react";
import Button from "./Button";
import Menu from "./Menu";

interface Props {
  /** The main action's label (with any icon). */
  children: ReactNode;
  onClick: () => void;
  /** MenuItems for the chevron's menu. */
  menu: ReactNode;
  /** Screen-reader name of the chevron. */
  menuLabel?: string;
  theme?: "primary" | "secondary";
  disabled?: boolean;
  /** Hover text for the main action (often a keyboard shortcut). */
  tooltip?: string;
}

/**
 * A Button with a chevron that opens a Menu of related actions: the
 * editor's Run / Retry buttons.
 */
export default function SplitButton({ children, onClick, menu, menuLabel = "More options", theme = "primary", disabled = false, tooltip }: Props) {
  return (
    <div className="inline-flex rounded-md shadow-xs">
      <Button theme={theme} onClick={onClick} disabled={disabled} tooltip={tooltip} className="rounded-r-none">
        {children}
      </Button>
      <Menu
        align="end"
        className="w-max"
        trigger={
          <Button theme={theme} disabled={disabled} aria-label={menuLabel} className="-ml-px rounded-l-none px-2">
            <span className="hero-chevron-down h-4 w-4" aria-hidden="true" />
          </Button>
        }
      >
        {menu}
      </Menu>
    </div>
  );
}
