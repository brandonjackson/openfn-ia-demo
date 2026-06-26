import type { RunStatus } from "../../mock-data/workflow";

const config: Record<RunStatus, { label: string; classes: string }> = {
  success: { label: "Success", classes: "bg-green-100 text-green-700" },
  failed: { label: "Failed", classes: "bg-red-100 text-red-600" },
  running: { label: "Running", classes: "bg-blue-100 text-blue-600" },
  pending: { label: "Pending", classes: "bg-gray-100 text-gray-500" },
};

/** Small status badge used in run history and the run inspector. */
export default function StatusPill({ status }: { status: RunStatus }) {
  const { label, classes } = config[status];
  return (
    <span
      className={`inline-block rounded-md px-2 py-0.5 text-xs font-medium ${classes}`}
    >
      {label}
    </span>
  );
}
