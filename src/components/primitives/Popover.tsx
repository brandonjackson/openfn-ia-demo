import type { ReactNode } from "react";
import Surface from "./Surface";
import { usePopover } from "./use-popover";

interface TriggerState {
  open: boolean;
  toggle: () => void;
}

interface Props {
  /** Renders the button that opens the panel; spread `aria-expanded` from `open` and `aria-haspopup="dialog"`. */
  trigger: (state: TriggerState) => ReactNode;
  /** Accessible name for the panel. */
  ariaLabel: string;
  /** What the panel holds; a function gets a way to close it, e.g. after an action. */
  children: ReactNode | ((close: () => void) => ReactNode);
  /** Pinned under the content, past a divider, e.g. the action the panel leads to. */
  footer?: ReactNode | ((close: () => void) => ReactNode);
  /** Which edge of the trigger the panel lines up with. */
  align?: "left" | "right";
  widthClass?: string;
  /** Start with the panel open (useful for stories and screenshots). */
  defaultOpen?: boolean;
}

/**
 * A panel of anything, opened from any trigger: a summary with an action at
 * its foot, details about where you're working. Clicking outside or pressing
 * Escape closes it.
 *
 * For a list of actions use {@link DropdownMenu}; for picking one value, a
 * `Picker`.
 */
export default function Popover({ trigger, ariaLabel, children, footer, align = "left", widthClass = "w-72", defaultOpen = false }: Props) {
  const { open, toggle, close, ref } = usePopover(defaultOpen);
  const render = (slot: ReactNode | ((close: () => void) => ReactNode)) => (typeof slot === "function" ? slot(close) : slot);

  return (
    <div ref={ref} className="relative inline-flex">
      {trigger({ open, toggle })}
      {open && (
        <Surface
          variant="popover"
          role="dialog"
          aria-label={ariaLabel}
          className={`absolute top-full z-50 mt-1.5 overflow-hidden ${align === "right" ? "right-0" : "left-0"} ${widthClass}`}
        >
          <div className="max-h-96 overflow-y-auto p-3">{render(children)}</div>
          {footer && <div className="border-t border-gray-100 p-2">{render(footer)}</div>}
        </Surface>
      )}
    </div>
  );
}
