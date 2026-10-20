import type { LucideIcon } from "lucide-react";

export type BadgeTone = "green" | "yellow" | "red" | "blue" | "purple" | "gray";

const toneClasses: Record<BadgeTone, string> = {
  green: "bg-green-100 text-green-700",
  yellow: "bg-yellow-100 text-yellow-700",
  red: "bg-red-100 text-red-700",
  blue: "bg-blue-100 text-blue-700",
  purple: "bg-purple-100 text-purple-700",
  gray: "bg-gray-100 text-gray-700",
};

// Known labels pick their own tone so callers can just pass a status.
const labelTones: Record<string, BadgeTone> = {
  Live: "green",
  Draft: "yellow",
  Success: "green",
  Failed: "red",
  Pending: "yellow",
};

interface Props {
  label: string;
  /** Overrides the tone inferred from the label (gray if unknown). */
  tone?: BadgeTone;
  icon?: LucideIcon;
}

export default function Badge({ label, tone, icon: Icon }: Props) {
  const resolvedTone = tone ?? labelTones[label] ?? "gray";
  const colors = toneClasses[resolvedTone];
  return (
    <span
      data-ui="tag"
      data-tone={resolvedTone}
      className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium ${colors}`}
    >
      {Icon && <Icon size={10} />}
      {label}
    </span>
  );
}
