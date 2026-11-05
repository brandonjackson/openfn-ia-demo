import type { BadgeTone } from "./Badge";

/** The fills for each swatch colour: a dot, a tile, and an icon on the tile. */
export const swatchFills: Record<BadgeTone, { dot: string; tile: string; icon: string }> = {
  indigo: { dot: "bg-indigo-500", tile: "bg-indigo-100", icon: "text-indigo-600" },
  green: { dot: "bg-green-500", tile: "bg-green-100", icon: "text-green-700" },
  yellow: { dot: "bg-yellow-400", tile: "bg-yellow-100", icon: "text-yellow-700" },
  red: { dot: "bg-red-500", tile: "bg-red-100", icon: "text-red-600" },
  pink: { dot: "bg-pink-500", tile: "bg-pink-100", icon: "text-pink-600" },
  gray: { dot: "bg-gray-400", tile: "bg-gray-100", icon: "text-gray-500" },
};
