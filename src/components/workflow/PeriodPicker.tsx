import type { ActivityPeriod } from "../../mock-data/runs";
import { activityPeriods } from "../../mock-data/runs";
import SegmentedControl from "../SegmentedControl";

/**
 * Picks how far back a set of numbers looks: the last 24 hours, 7 days or
 * 30 days. The same pill switcher as the health page, for the canvas's
 * activity overlay (compact) and the failures view.
 */
export default function PeriodPicker({
  value,
  onChange,
  compact = false,
}: {
  value: ActivityPeriod;
  onChange: (period: ActivityPeriod) => void;
  /** Short labels (24h, 7d, 30d) where there's little room, as on the canvas chip. */
  compact?: boolean;
}) {
  return (
    <SegmentedControl
      variant="pill"
      options={activityPeriods.map((p) => ({ id: p.id, label: compact ? p.shortLabel : p.label }))}
      value={value}
      onChange={(v) => onChange(v as ActivityPeriod)}
    />
  );
}
