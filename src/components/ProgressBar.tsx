interface Props {
  value: number;
  max: number;
  /** Shows "value/max" to the right of the bar. */
  showCount?: boolean;
}

/** Thin horizontal bar showing progress towards a target, e.g. systems connected. */
export default function ProgressBar({ value, max, showCount = false }: Props) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  return (
    <div className="flex items-center gap-3">
      <div
        className="h-1.5 flex-1 overflow-hidden rounded-full bg-gray-200"
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
      >
        <div className="h-full rounded-full bg-blue-500 transition-all" style={{ width: `${pct}%` }} />
      </div>
      {showCount && (
        <span className="flex-shrink-0 text-xs text-gray-500">
          {value}/{max}
        </span>
      )}
    </div>
  );
}
