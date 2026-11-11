import type { LucideIcon } from "lucide-react";

/** The colours a badge comes in. */
export type BadgeTone = "green" | "yellow" | "red" | "indigo" | "pink" | "gray";

const toneClasses: Record<BadgeTone, string> = {
  green: "bg-badge-green-bg text-badge-green-fg",
  yellow: "bg-badge-yellow-bg text-badge-yellow-fg",
  red: "bg-badge-red-bg text-badge-red-fg",
  indigo: "bg-badge-indigo-bg text-badge-indigo-fg",
  pink: "bg-badge-pink-bg text-badge-pink-fg",
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
