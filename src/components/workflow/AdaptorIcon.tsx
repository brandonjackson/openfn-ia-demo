import type { AdaptorKind, TriggerType } from "../../mock-data/workflow";
import { triggerTypes } from "../../mock-data/workflow";
import { hasAdaptorLogo } from "../../adaptor-lookup";
import AdaptorLogo from "../AdaptorLogo";

type Size = "xs" | "sm" | "md" | "lg";

const boxSize: Record<Size, string> = {
  xs: "w-4 h-4 text-[7px] rounded",
  sm: "w-7 h-7 text-[9px] rounded-md",
  md: "w-10 h-10 text-[11px] rounded-lg",
  lg: "w-14 h-14 text-sm rounded-xl",
};

/**
 * Adaptor icons mimic the Lightning node glyphs. Most adaptors render as a
 * coloured tile with the package shortname (e.g. red "http"); the "common"
 * adaptor uses the bordered "Fn" tile.
 */
const adaptorStyle: Partial<Record<AdaptorKind, { label: string; classes: string }>> = {
  http: { label: "http", classes: "bg-red-600 text-white" },
  common: { label: "Fn", classes: "bg-gray-100 text-gray-700 border border-gray-300" },
  dhis2: { label: "d2", classes: "bg-emerald-600 text-white" },
  salesforce: { label: "sf", classes: "bg-sky-500 text-white" },
  postgresql: { label: "pg", classes: "bg-indigo-600 text-white" },
};

const logoSize: Record<Size, "2xs" | "sm" | "md" | "lg"> = { xs: "2xs", sm: "sm", md: "md", lg: "lg" };

export function AdaptorIcon({
  adaptor,
  size = "md",
}: {
  adaptor: AdaptorKind;
  size?: Size;
}) {
  // Prefer the adaptor's real logo; the lettered tile is the fallback.
  if (hasAdaptorLogo(adaptor)) return <AdaptorLogo adaptor={adaptor} size={logoSize[size]} />;
  const style = adaptorStyle[adaptor] ?? { label: adaptor.slice(0, 2), classes: "bg-gray-600 text-white" };
  return (
    <span
      className={`inline-flex items-center justify-center font-semibold leading-none ${boxSize[size]} ${style.classes}`}
    >
      {style.label}
    </span>
  );
}

/** Circular trigger glyph (its icon from `triggerTypes`) shown at the top of a workflow. */
export function TriggerIcon({
  triggerType,
  size = "md",
}: {
  triggerType: TriggerType;
  size?: Size;
}) {
  const Icon = triggerTypes[triggerType].icon;
  const dims = size === "lg" ? "w-14 h-14" : size === "sm" ? "w-7 h-7" : size === "xs" ? "w-4 h-4" : "w-10 h-10";
  const iconSize = size === "lg" ? 24 : size === "sm" ? 13 : size === "xs" ? 10 : 18;
  return (
    <span
      className={`inline-flex items-center justify-center rounded-full bg-white border border-gray-300 text-gray-500 ${dims}`}
    >
      <Icon size={iconSize} />
    </span>
  );
}
