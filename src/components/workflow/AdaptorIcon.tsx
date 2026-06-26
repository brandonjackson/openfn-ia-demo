import { Globe, Clock, Radio } from "lucide-react";
import type { AdaptorKind } from "../../mock-data/workflow";

type Size = "sm" | "md" | "lg";

const boxSize: Record<Size, string> = {
  sm: "w-7 h-7 text-[9px] rounded-md",
  md: "w-10 h-10 text-[11px] rounded-lg",
  lg: "w-14 h-14 text-sm rounded-xl",
};

/**
 * Adaptor icons mimic the Lightning node glyphs. Most adaptors render as a
 * coloured tile with the package shortname (e.g. red "http"); the "common"
 * adaptor uses the bordered "Fn" tile.
 */
const adaptorStyle: Record<AdaptorKind, { label: string; classes: string }> = {
  http: { label: "http", classes: "bg-red-600 text-white" },
  common: { label: "Fn", classes: "bg-gray-100 text-gray-700 border border-gray-300" },
  dhis2: { label: "d2", classes: "bg-emerald-600 text-white" },
  salesforce: { label: "sf", classes: "bg-sky-500 text-white" },
  postgresql: { label: "pg", classes: "bg-indigo-600 text-white" },
};

export function AdaptorIcon({
  adaptor,
  size = "md",
}: {
  adaptor: AdaptorKind;
  size?: Size;
}) {
  const style = adaptorStyle[adaptor];
  return (
    <span
      className={`inline-flex items-center justify-center font-semibold leading-none ${boxSize[size]} ${style.classes}`}
    >
      {style.label}
    </span>
  );
}

const triggerIconMap = {
  webhook: Globe,
  cron: Clock,
  kafka: Radio,
};

/** Circular trigger glyph (webhook = globe) shown at the top of a workflow. */
export function TriggerIcon({
  triggerType,
  size = "md",
}: {
  triggerType: "webhook" | "cron" | "kafka";
  size?: Size;
}) {
  const Icon = triggerIconMap[triggerType];
  const dims = size === "lg" ? "w-14 h-14" : size === "sm" ? "w-7 h-7" : "w-10 h-10";
  const iconSize = size === "lg" ? 24 : size === "sm" ? 13 : 18;
  return (
    <span
      className={`inline-flex items-center justify-center rounded-full bg-white border border-gray-300 text-gray-500 ${dims}`}
    >
      <Icon size={iconSize} />
    </span>
  );
}
