import type { ReactNode } from "react";
import Button from "../Button";

/**
 * One action card on the Maintenance page (maintenance_live/index.html.heex):
 * a title and description on the left, a primary "Run" button on the right.
 */
export default function MaintenanceCard({
  id,
  title,
  description,
  onRun,
  running = false,
}: {
  id?: string;
  title: string;
  description: ReactNode;
  onRun?: () => void;
  /** Disables the button while the (mock) action runs. */
  running?: boolean;
}) {
  return (
    <div
      id={id}
      className="bg-white shadow-xs rounded-lg border border-gray-200 p-6 flex items-start justify-between gap-6"
    >
      <div className="flex flex-col">
        <h2 className="text-lg font-semibold text-secondary-900">{title}</h2>
        <p className="mt-1 text-sm text-secondary-600">{description}</p>
      </div>
      <Button onClick={onRun} disabled={running}>
        Run
      </Button>
    </div>
  );
}
