import { useNavigate } from "react-router-dom";
import type { SandboxRow } from "../../../mock-data/sandboxes";
import SandboxActions from "./SandboxActions";
import WorkspaceBadge from "./WorkspaceBadge";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function deletionTooltip(iso: string) {
  const at = new Date(iso);
  const formatted = `${String(at.getUTCDate()).padStart(2, "0")} ${MONTHS[at.getUTCMonth()]} ${at.getUTCFullYear()}`;
  const days = Math.floor((at.getTime() - Date.now()) / 86_400_000);
  const suffix = days > 1 ? ` (in ${days} days)` : days === 1 ? " (in 1 day)" : days === 0 ? " (today)" : "";
  return `Scheduled for deletion on ${formatted}${suffix}. Cancel the deletion to restore it.`;
}

/**
 * A row on the sandboxes page (SandboxLive.Components root_project_card /
 * sandbox_card): a colour strip, the name and badges, and, for sandboxes,
 * Merge / Edit / Delete. The root project's strip is indigo and it's badged
 * "main". A sandbox scheduled for deletion is struck through, dimmed, and
 * offers Restore. Clicking a live card opens that project's workflows.
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
  const env = workspace.env?.trim() ? workspace.env : isRoot ? "main" : null;
  const badges = (
    <>
      {env && <WorkspaceBadge id={`env-badge-${workspace.id}`} label={env} />}
      {isCurrent && <WorkspaceBadge id={`active-badge-${workspace.id}`} label="active" />}
    </>
  );

  if (workspace.scheduledDeletion) {
    return (
      <div
        id={`sandbox-card-${workspace.id}`}
        className="group block rounded-xl border border-gray-200 bg-gray-50 opacity-75 overflow-hidden"
        aria-disabled="true"
      >
        <div className="flex items-stretch">
          <div
            className="w-3 flex-shrink-0 opacity-60"
            style={{ backgroundColor: workspace.color ?? "var(--color-primary-600)" }}
          />
          <div className="flex-1 px-4 py-4 flex items-center justify-between min-w-0">
            <div className="flex-1 min-w-0 cursor-not-allowed" title={deletionTooltip(workspace.scheduledDeletion)}>
              <div className="flex items-center gap-3 mb-1">
                <h3 className="font-semibold text-lg text-slate-500 line-through truncate">{workspace.name}</h3>
                {badges}
              </div>
            </div>
            <SandboxActions sandbox={workspace} onRestore={onRestore} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      id={isRoot ? undefined : `sandbox-card-${workspace.id}`}
      className="group block cursor-pointer rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition-all duration-200 overflow-hidden"
      onClick={() => navigate(`/projects/${workspace.id}/w`)}
      role="button"
      tabIndex={0}
    >
      <div className="flex items-stretch">
        {isRoot ? (
          <div className="w-3 flex-shrink-0 bg-indigo-600" />
        ) : (
          <div className="w-3 flex-shrink-0" style={{ backgroundColor: workspace.color ?? "var(--color-primary-600)" }} />
        )}
        <div className="flex-1 px-4 py-4 flex items-center justify-between min-w-0">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-1">
              <h3 className="font-semibold text-slate-900 text-lg group-hover:text-slate-800 truncate">{workspace.name}</h3>
              {badges}
            </div>
          </div>
          {!isRoot && <SandboxActions sandbox={workspace} onMerge={onMerge} onEdit={onEdit} onDelete={onDelete} />}
        </div>
      </div>
    </div>
  );
}
