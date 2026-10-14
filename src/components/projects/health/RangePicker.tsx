import { HEALTH_RANGES, type HealthRange } from "../../../mock-data/workflow-health";
import { cn } from "../../../utils/cn";

/**
 * The health page's time range (assets/js/health/RangePicker.tsx): a gray
 * segmented radio group; ranges longer than the project's history retention
 * are disabled with a tooltip.
 */
export default function RangePicker({
  days,
  onChange,
  retentionDays = null,
}: {
  days: HealthRange["days"];
  onChange: (days: HealthRange["days"]) => void;
  retentionDays?: number | null;
}) {
  return (
    <div role="radiogroup" aria-label="Time range" className="flex gap-1 rounded-lg bg-gray-50 p-1">
      {HEALTH_RANGES.map((range) => {
        const disabled = retentionDays !== null && Number(range.days) > retentionDays;
        const checked = range.days === days;
        return (
          <span
            key={range.days}
            className="flex"
            title={disabled ? `Only ${retentionDays} days of history are kept for this project.` : undefined}
          >
            <button
              type="button"
              role="radio"
              aria-checked={checked}
              disabled={disabled}
              onClick={() => onChange(range.days)}
              className={cn(
                "cursor-pointer rounded-md px-3 py-1.5 text-sm font-medium text-gray-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600",
                checked ? "bg-white text-primary-600 shadow-xs" : "hover:text-gray-900",
                disabled && "cursor-not-allowed text-gray-300 hover:text-gray-300"
              )}
            >
              {range.label}
            </button>
          </span>
        );
      })}
    </div>
  );
}
