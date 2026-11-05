import type { LucideIcon } from "lucide-react";

import type { BadgeTone } from "../../model/page-data";

export type { BadgeTone };

const toneClasses: Record<BadgeTone, string> = {
  green: "bg-green-100 text-green-700",
  yellow: "bg-yellow-100 text-yellow-700",
  red: "bg-red-100 text-red-700",
  indigo: "bg-indigo-100 text-indigo-700",
  pink: "bg-pink-100 text-pink-700",
  gray: "bg-gray-100 text-gray-700",
};

// Known labels pick their own tone so callers can just pass a status. Run
// statuses are drawn by `StatusPill`, not here.
const labelTones: Record<string, BadgeTone> = {
  Live: "green",
  Draft: "yellow",
};

interface Props {
  label: string;
  /** Overrides the tone inferred from the label (gray if unknown). */
  tone?: BadgeTone;
  icon?: LucideIcon;
  /**
   * `pill` (the default) is a rounded status or label; `tag` is the small,
   * square-cornered note beside a name, e.g. a component's kind or "Read only".
   */
  shape?: "pill" | "tag";
}

export default function Badge({ label, tone, icon: Icon, shape = "pill" }: Props) {
  const resolvedTone = tone ?? labelTones[label] ?? "gray";
  const colors = toneClasses[resolvedTone];
  return (
    <span
      data-ui="tag"
      data-tone={resolvedTone}
      className={`inline-flex flex-shrink-0 items-center gap-1 whitespace-nowrap font-medium ${
        shape === "tag" ? "rounded px-1.5 py-0.5 text-[11px]" : "rounded-full px-2.5 py-0.5 text-xs"
      } ${colors}`}
    >
      {Icon && <Icon size={10} />}
      {label}
    </span>
  );
}
