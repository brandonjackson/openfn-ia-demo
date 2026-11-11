/** The colours a status dot comes in. */
export type StatusDotTone = "green" | "gray" | "amber" | "red";

const tones: Record<StatusDotTone, string> = {
  green: "bg-green-500",
  gray: "bg-gray-400",
  amber: "bg-amber-500",
  red: "bg-red-500",
};

interface Props {
  tone?: StatusDotTone;
  /** Says what the dot means to screen readers. Leave it out when the words beside it already do. */
  label?: string;
}

/**
 * A small coloured dot before a state's name, e.g. green for "Live" and grey
 * for "Paused". Run statuses have their own, in `StatusPill`.
 */
export default function StatusDot({ tone = "gray", label }: Props) {
  return (
    <span
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      title={label}
      className={`inline-block h-2 w-2 flex-none rounded-full ${tones[tone]}`}
    />
  );
}
