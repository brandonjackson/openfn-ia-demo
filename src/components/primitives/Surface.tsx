import type { HTMLAttributes, Ref } from "react";

export type SurfaceVariant = "raised" | "floating" | "popover";

interface Props extends HTMLAttributes<HTMLDivElement> {
  /**
   * `raised` sits just off what's under it: toolbar groups, the runs bar, a
   * node card. `floating` hovers well above: the inspector, the runs list, a
   * floating tray. `popover` is a menu or picker opened from a trigger.
   */
  variant?: SurfaceVariant;
  as?: "div" | "section" | "aside" | "nav";
  ref?: Ref<HTMLDivElement>;
}

const looks: Record<SurfaceVariant, string> = {
  raised: "rounded-xl border border-gray-200 bg-white shadow-sm",
  floating: "rounded-xl border border-gray-200 bg-white shadow-xl",
  popover: "rounded-lg border border-gray-200 bg-white shadow-lg",
};

/**
 * The white, bordered, shadowed frame of anything that floats: toolbar groups,
 * bars over the canvas, cards, dialogs and menus. It carries only the frame,
 * so the caller's `className` adds layout (flex, size, padding, position).
 */
export default function Surface({ variant = "raised", as = "div", className = "", ...rest }: Props) {
  // Every option is a plain block element, so they share the div's props.
  const Tag = as as "div";
  return <Tag {...rest} className={`${looks[variant]} ${className}`} />;
}
