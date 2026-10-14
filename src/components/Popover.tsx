import { Popover as HeadlessPopover, PopoverButton, PopoverPanel } from "@headlessui/react";
import { Fragment, type ReactNode } from "react";
import { cn } from "../utils/cn";
import { floatingPanelClasses, type FloatingAlign } from "./floating";

interface Props {
  /**
   * The element that opens the popover. A single element that accepts a ref
   * and spreads its props, as Button and IconButton do.
   */
  trigger: ReactNode;
  align?: FloatingAlign;
  /** Width (and padding) classes for the panel. */
  className?: string;
  /** Panel content. Pass a function to get a `close` callback. */
  children: ReactNode | ((close: () => void) => ReactNode);
}

/**
 * A floating panel with any content (filters, forms, details), opened from
 * a trigger. Use Menu instead when the content is a list of actions.
 */
export default function Popover({ trigger, align = "start", className = "w-60", children }: Props) {
  return (
    <HeadlessPopover>
      <PopoverButton as={Fragment}>{trigger}</PopoverButton>
      <PopoverPanel anchor={{ to: `bottom ${align}`, gap: 8 }} transition data-ui="popover" className={cn(floatingPanelClasses, className)}>
        {({ close }) => <>{typeof children === "function" ? children(close) : children}</>}
      </PopoverPanel>
    </HeadlessPopover>
  );
}
