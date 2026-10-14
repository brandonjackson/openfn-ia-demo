import { HEALTH_RANGES, type HealthRange } from "../../../mock-data/workflow-health";
import Tabs from "../../Tabs";

/**
 * The health page's time range (assets/js/health/RangePicker.tsx): a gray
 * segmented group; ranges longer than the project's history retention are
 * disabled with a tooltip.
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
    <Tabs<HealthRange["days"]>
      variant="pill"
      label="Time range"
      active={days}
      onChange={onChange}
      tabs={HEALTH_RANGES.map((range) => ({
        id: range.days,
        label: range.label,
        disabled: retentionDays !== null && Number(range.days) > retentionDays,
        disabledReason: `Only ${retentionDays} days of history are kept for this project.`,
      }))}
    />
  );
}
