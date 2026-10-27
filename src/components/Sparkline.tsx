interface Props {
  /** Values, oldest first. */
  values: number[];
  /** Describes the trend for screen readers, e.g. "Runs per day, last 7 days". */
  label: string;
  /** Sets the line colour via `currentColor`, plus any sizing. */
  className?: string;
}

/** A small trend line with no axes, for use inside a stat tile. */
export default function Sparkline({ values, label, className = "h-8 w-full text-indigo-500" }: Props) {
  if (values.length < 2) return null;
  const max = Math.max(...values);
  const min = Math.min(...values);
  const span = max - min || 1;
  // Inset by the stroke so the line isn't clipped at its peaks.
  const points = values
    .map((v, i) => {
      const x = (i / (values.length - 1)) * 100;
      const y = 30 - ((v - min) / span) * 28;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg
      viewBox="0 0 100 32"
      preserveAspectRatio="none"
      role="img"
      aria-label={`${label}: ${values.join(", ")}`}
      className={className}
    >
      <polyline
        points={points}
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinejoin="round"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
