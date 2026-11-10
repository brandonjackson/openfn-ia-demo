/** The colours a count comes in. */
export type CountBadgeTone = "indigo" | "amber";

const tones: Record<CountBadgeTone, string> = {
  indigo: "bg-indigo-600",
  amber: "bg-amber-800",
};

interface Props {
  /** The number to show; past 99 it reads "99+". */
  count: number;
  /** `indigo` (the default) for a count on a plain control; `amber` inside an amber chip, e.g. a sandbox's changes. */
  tone?: CountBadgeTone;
  /** Pinned to the top-right corner of a `relative` parent, as on an icon button. */
  corner?: boolean;
}

/**
 * A small round count in white on a solid colour: how many changes a sandbox
 * holds, how many things an icon button lists. It's decoration, so it's
 * hidden from screen readers; say the count in the control's label.
 */
export default function CountBadge({ count, tone = "indigo", corner = false }: Props) {
  return (
    <span
      className={`inline-flex h-4 min-w-4 flex-none items-center justify-center rounded-full px-1 font-sans text-[11px] font-semibold leading-none text-white ${tones[tone]} ${
        corner ? "absolute -right-1 -top-1" : ""
      }`}
      aria-hidden
    >
      {count > 99 ? "99+" : count}
    </span>
  );
}
