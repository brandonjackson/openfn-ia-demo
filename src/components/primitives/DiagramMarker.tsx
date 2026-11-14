import type { LucideIcon } from "lucide-react";

interface Props {
  /** The glyph in the round marker. */
  icon: LucideIcon;
  /** What the marker stands for, read out and shown on hover, e.g. "On success path". */
  title: string;
  /** More to show on hover, under the title, e.g. the rule it follows. */
  detail?: string;
  /** A short name drawn in a tab beside the marker; long ones are cut short. */
  label?: string;
  /** Drawn dashed and faded: the line it marks is off. */
  inactive?: boolean;
  /** Ringed, for the one that's selected. */
  selected?: boolean;
  /** Makes it a button that selects what it marks. */
  onClick?: () => void;
}

/** The most of a label the tab shows before it's cut short. */
const LABEL_MAX = 22;

/**
 * A round marker on a line in a diagram, with a glyph saying what kind of
 * line it is and, optionally, a label in a tab beside it. Dashed and faded
 * when the line is off, ringed when selected, and a button when it can be
 * picked.
 */
export default function DiagramMarker({ icon: Icon, title, detail, label, inactive = false, selected = false, onClick }: Props) {
  const shown = label && label.length > LABEL_MAX ? `${label.slice(0, LABEL_MAX)}…` : label;
  const name = `${title}${label ? `: ${label}` : ""}${inactive ? " (off)" : ""}`;
  const border = selected ? "border-indigo-500" : "border-gray-300";
  const content = (
    <>
      <span
        className={`relative z-10 inline-flex h-7 w-7 flex-none items-center justify-center rounded-full border bg-white shadow-sm ${border} ${
          inactive ? "border-dashed text-gray-400" : "text-gray-500"
        } ${selected ? "ring-2 ring-indigo-200" : ""}`}
      >
        <Icon size={14} strokeWidth={2.5} />
      </span>
      {shown && (
        <span
          className={`-ml-3 inline-flex h-6 items-center whitespace-nowrap rounded-r-full border border-l-0 bg-white pl-4 pr-2 text-[11px] font-medium shadow-sm ${border} ${
            inactive ? "border-dashed text-gray-400" : "text-gray-600"
          }`}
        >
          {shown}
        </span>
      )}
    </>
  );
  const tip = detail ? `${name}\n${detail}` : name;
  const frame = `inline-flex items-center rounded-full ${inactive ? "opacity-80" : ""}`;
  return onClick ? (
    <button
      type="button"
      aria-label={name}
      aria-pressed={selected}
      title={tip}
      onClick={onClick}
      className={`${frame} cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2`}
    >
      {content}
    </button>
  ) : (
    <span title={tip} aria-label={name} role="img" className={frame}>
      {content}
    </span>
  );
}
