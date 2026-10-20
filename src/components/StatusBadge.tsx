import { AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import type { HealthState } from "../page-data";
import Badge from "./Badge";

const config = {
  operational: { label: "Operational", tone: "green", icon: CheckCircle2 },
  degraded: { label: "Degraded", tone: "yellow", icon: AlertTriangle },
  down: { label: "Down", tone: "red", icon: XCircle },
} as const;

/** Health of a system or workflow, always shown as icon + label, never colour alone. */
export default function StatusBadge({ status }: { status: HealthState }) {
  const c = config[status];
  return <Badge label={c.label} tone={c.tone} icon={c.icon} />;
}
