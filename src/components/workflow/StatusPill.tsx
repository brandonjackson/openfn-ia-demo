import type { RunStatus } from "../../mock-data/workflow";

const config: Record<RunStatus, { label: string; classes: string; dot: string }> = {
  success: { label: "Success", classes: "bg-green-100 text-green-700", dot: "bg-green-500" },
  failed: { label: "Failed", classes: "bg-red-100 text-red-600", dot: "bg-red-500" },
  running: { label: "Running", classes: "bg-blue-100 text-blue-600", dot: "bg-blue-500 animate-pulse" },
  pending: { label: "Pending", classes: "bg-gray-100 text-gray-500", dot: "bg-gray-300" },
};

/**
 * A run's status: a small badge in the run inspector, or just a coloured dot
 * where space is tight, such as rows in the history panel.
 */
export default function StatusPill({
  status,
  variant = "pill",
}: {
  status: RunStatus;
  /** "dot" shows only the colour, with the status as its label for screen readers. */
  variant?: "pill" | "dot";
}) {
  const { label, classes, dot } = config[status];
  if (variant === "dot") {
    return (
      <span
        role="img"
        aria-label={label}
        title={label}
        className={`inline-block h-2 w-2 flex-shrink-0 rounded-full ${dot}`}
      />
    );
  }
  return (
    <span
      className={`inline-block rounded-md px-2 py-0.5 text-xs font-medium ${classes}`}
    >
      {label}
    </span>
  );
}
