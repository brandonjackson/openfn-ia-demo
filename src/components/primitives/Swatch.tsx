import type { LucideIcon } from "lucide-react";
import type { BadgeTone } from "./Badge";
import { swatchFills as fills } from "./swatch-fills";


interface Props {
  tone: BadgeTone;
  /** `dot` is a small round mark beside a name; `tile` the 40px square that leads a list row. */
  size?: "dot" | "tile";
  /** Drawn in the tile. */
  icon?: LucideIcon;
  /** Read by screen readers, e.g. "Green". */
  label?: string;
}

/**
 * A colour someone picked to tell things apart, such as a sandbox: a dot
 * beside its name, or a tinted tile leading its row.
 */
export default function Swatch({ tone, size = "dot", icon: Icon, label }: Props) {
  const fill = fills[tone];
  if (size === "tile") {
    return (
      <span role={label ? "img" : undefined} aria-label={label} className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg ${fill.tile}`}>
        {Icon && <Icon size={20} className={fill.icon} />}
      </span>
    );
  }
  return <span role={label ? "img" : undefined} aria-label={label} className={`inline-block h-2.5 w-2.5 flex-shrink-0 rounded-full ${fill.dot}`} />;
}

