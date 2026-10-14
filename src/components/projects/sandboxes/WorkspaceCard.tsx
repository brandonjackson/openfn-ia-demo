import { useNavigate } from "react-router-dom";
import type { SandboxRow } from "../../../mock-data/sandboxes";
import { cn } from "../../../utils/cn";
import { formatUtcDate } from "../../../utils/format";
import Card from "../../Card";
import Heading from "../../Heading";
import Pill from "../../Pill";
import SandboxActions from "./SandboxActions";

function deletionTooltip(iso: string) {
  const at = new Date(iso);
  const days = Math.floor((at.getTime() - Date.now()) / 86_400_000);
  const suffix = days > 1 ? ` (in ${days} days)` : days === 1 ? " (in 1 day)" : days === 0 ? " (today)" : "";
  return `Scheduled for deletion on ${formatUtcDate(iso)}${suffix}. Cancel the deletion to restore it.`;
}

/**
 * A row on the sandboxes page (SandboxLive.Components root_project_card /
 * sandbox_card): a colour strip, the name and badges ("main", "active" or
 * the env name), and, for sandboxes, Merge / Edit / Delete. The root
 * project's strip is indigo. A sandbox scheduled for deletion is struck
 * through, dimmed, and offers Restore. Clicking a live card opens that
 * project's workflows.
 */
export default function WorkspaceCard({
  workspace,
  isRoot = false,
  isCurrent = false,
  onMerge,
  onEdit,
  onDelete,
  onRestore,
}: {
  workspace: SandboxRow;
  isRoot?: boolean;
  isCurrent?: boolean;
  onMerge?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onRestore?: () => void;
}) {
  const navigate = useNavigate();
  const deleted = workspace.scheduledDeletion;
  const env = workspace.env?.trim() ? workspace.env : isRoot ? "main" : null;
  const color = (!isRoot && workspace.color) || "var(--color-primary-600)";

  return (
    <Card
      id={isRoot && !deleted ? undefined : `sandbox-card-${workspace.id}`}
      padding="none"
      muted={!!deleted}
      className={cn("flex overflow-hidden", deleted ? "opacity-75" : "hover:bg-gray-50")}
    >
      <div className={cn("w-3 shrink-0", deleted && "opacity-60")} style={{ backgroundColor: color }} />
      <div
        className={cn("flex min-w-0 flex-1 items-center gap-3 p-4", deleted ? "cursor-not-allowed" : "cursor-pointer")}
        {...(deleted
          ? { "aria-disabled": true, title: deletionTooltip(deleted) }
          : { role: "button", tabIndex: 0, onClick: () => navigate(`/projects/${workspace.id}/w`) })}
      >
        <Heading size="lg" className={cn("truncate", deleted && "text-gray-500 line-through")}>
          {workspace.name}
        </Heading>
        {env && <Badge id={`env-badge-${workspace.id}`} label={env} />}
        {isCurrent && <Badge id={`active-badge-${workspace.id}`} label="active" />}
      </div>
      {(!isRoot || deleted) && (
        <div className="flex items-center pr-4">
          <SandboxActions sandbox={workspace} onMerge={onMerge} onEdit={onEdit} onDelete={onDelete} onRestore={onRestore} />
        </div>
      )}
    </Card>
  );
}

function Badge({ id, label }: { id: string; label: string }) {
  return (
    <Pill id={id} className="max-w-32" title={label}>
      <span className="truncate">{label}</span>
    </Pill>
  );
}
