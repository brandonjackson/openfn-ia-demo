import type { ReactNode } from "react";
import Button from "../Button";
import Card from "../Card";

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
    <Card
      id={id}
      padding="lg"
      title={title}
      description={description}
      action={
        <Button onClick={onRun} disabled={running}>
          Run
        </Button>
      }
    />
  );
}
