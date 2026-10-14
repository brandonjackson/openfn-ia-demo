import { Link } from "react-router-dom";
import type { SandboxRow } from "../../../mock-data/sandboxes";
import WorkspaceCard from "./WorkspaceCard";

/**
 * The sandboxes page list (SandboxLive.Components.workspace_list): the root
 * project card, its live sandboxes (or the dashed "No sandboxes found" box),
 * then a "Scheduled for deletion" section.
 */
export default function WorkspaceList({
  root,
  sandboxes,
  currentProjectId,
  canCreate = true,
  disabledReason,
  onMerge,
  onEdit,
  onDelete,
  onRestore,
}: {
  root: SandboxRow;
  sandboxes: SandboxRow[];
  currentProjectId: string;
  canCreate?: boolean;
  disabledReason?: string;
  onMerge?: (s: SandboxRow) => void;
  onEdit?: (s: SandboxRow) => void;
  onDelete?: (s: SandboxRow) => void;
  onRestore?: (s: SandboxRow) => void;
}) {
  const active = sandboxes.filter((s) => !s.scheduledDeletion);
  const scheduled = sandboxes.filter((s) => s.scheduledDeletion);
  const card = (s: SandboxRow) => (
    <WorkspaceCard
      key={s.id}
      workspace={s}
      isCurrent={s.id === currentProjectId}
      onMerge={() => onMerge?.(s)}
      onEdit={() => onEdit?.(s)}
      onDelete={() => onDelete?.(s)}
      onRestore={() => onRestore?.(s)}
    />
  );

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <WorkspaceCard workspace={root} isRoot={root.parentId === null} isCurrent={root.id === currentProjectId} />
        <div>
          {active.length === 0 && scheduled.length === 0 ? (
            <div className="text-gray-500 text-center py-8 rounded-lg border-2 border-dashed border-gray-200">
              <div className="space-y-3">
                <div className="text-base font-medium">No sandboxes found</div>
                <div className="text-sm">
                  {canCreate ? (
                    <>
                      <Link
                        to={`/projects/${currentProjectId}/sandboxes/new`}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                      >
                        Create your first sandbox
                      </Link>{" "}
                      to start experimenting.
                    </>
                  ) : (
                    disabledReason
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">{active.map(card)}</div>
          )}
        </div>
      </div>
      {scheduled.length > 0 && (
        <div id="scheduled-for-deletion-section">
          <h2 className="text-2xl font-bold text-slate-900 mb-3">Scheduled for deletion</h2>
          <div className="space-y-3">{scheduled.map(card)}</div>
        </div>
      )}
    </div>
  );
}
