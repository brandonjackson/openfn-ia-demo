import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export type IconTileSize = "2xs" | "xs" | "sm" | "md" | "lg";

const box: Record<IconTileSize, string> = {
  "2xs": "h-4 w-4 rounded text-[7px]",
  xs: "h-5 w-5 rounded text-[8px]",
  sm: "h-8 w-8 rounded-lg text-[10px]",
  md: "h-10 w-10 rounded-lg text-[11px]",
  lg: "h-12 w-12 rounded-xl text-sm",
};

const glyph: Record<IconTileSize, number> = { "2xs": 10, xs: 12, sm: 16, md: 20, lg: 24 };

const tones = {
  /** Grey fill, as at the start of a list row. */
  gray: "bg-gray-100 text-gray-400",
  /** Brand tint, for a feature or something selected. */
  indigo: "border border-indigo-200 bg-indigo-50 text-indigo-500",
  /** White with a border, behind logos. */
  white: "border border-gray-200 bg-white text-gray-500",
  /** Dark, for letters standing in for a missing logo. */
  dark: "bg-gray-600 font-semibold leading-none text-white",
};

interface Props {
  icon?: LucideIcon;
  /** Anything in place of the icon, e.g. a logo image. */
  children?: ReactNode;
  size?: IconTileSize;
  tone?: keyof typeof tones;
  /** Takes the colour of the row it's in when that row is hovered (`group`). */
  hoverTint?: boolean;
  /** A circle rather than a rounded square, e.g. a trigger's glyph. */
  round?: boolean;
}

/**
 * A rounded square holding one glyph or logo: the start of a list row, a
 * feature card, a pick in the "Connect a system" list, an adaptor's logo.
 */
export default function IconTile({ icon: Icon, children, size = "md", tone = "gray", hoverTint = false, round = false }: Props) {
  return (
    <span
      className={`inline-flex flex-shrink-0 items-center justify-center overflow-hidden ${round ? box[size].replace(/rounded(-\w+)?/, "rounded-full") : box[size]} ${tones[tone]} ${
        hoverTint ? "group-hover:bg-indigo-50 group-hover:text-indigo-500" : ""
      }`}
    >
      {children ?? (Icon && <Icon size={glyph[size]} />)}
    </span>
  );
}
