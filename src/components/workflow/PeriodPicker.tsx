import type { ActivityPeriod } from "../../mock-data/runs";
import { activityPeriods } from "../../mock-data/runs";
import SegmentedControl from "../SegmentedControl";

/**
 * Picks how far back a set of numbers looks: the last 24 hours, 7 days or
 * 30 days. The same pill switcher as the health page, for the canvas's runs
 * bar (compact, with Off) and the failures view.
 */
export default function PeriodPicker({
  value,
  onChange,
  compact = false,
  label,
  off = false,
  onOff,
}: {
  value: ActivityPeriod;
  onChange: (period: ActivityPeriod) => void;
  /** Short labels (24h, 7d, 30d) where there's little room, as on the canvas's runs bar. */
  compact?: boolean;
  /** Named before the options, e.g. "Runs". */
  label?: string;
  /** "Off" is selected rather than a period. */
  off?: boolean;
  /** Adds an "Off" option first, for turning the numbers off altogether. */
  onOff?: () => void;
}) {
  return (
    <SegmentedControl
      variant="pill"
      label={label}
      options={[
        ...(onOff ? [{ id: "off", label: "Off" }] : []),
        ...activityPeriods.map((p) => ({ id: p.id, label: compact ? p.shortLabel : p.label })),
      ]}
      value={off ? "off" : value}
      onChange={(v) => (v === "off" ? onOff?.() : onChange(v as ActivityPeriod))}
    />
  );
}
