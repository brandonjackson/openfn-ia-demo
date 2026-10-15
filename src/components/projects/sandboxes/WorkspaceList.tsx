import type { SandboxRow } from "../../../types/sandboxes";
import Card from "../../Card";
import Heading from "../../Heading";
import TextLink from "../../TextLink";
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
        {active.length === 0 && scheduled.length === 0 ? (
          <Card dashed className="space-y-3 py-8 text-center text-sm text-gray-500">
            <p className="text-base font-medium">No sandboxes found</p>
            <p>
              {canCreate ? (
                <>
                  <TextLink to={`/projects/${currentProjectId}/sandboxes/new`}>Create your first sandbox</TextLink> to
                  start experimenting.
                </>
              ) : (
                disabledReason
              )}
            </p>
          </Card>
        ) : (
          active.map(card)
        )}
      </div>
      {scheduled.length > 0 && (
        <div id="scheduled-for-deletion-section" className="space-y-3">
          <Heading as="h2" size="lg">
            Scheduled for deletion
          </Heading>
          {scheduled.map(card)}
        </div>
      )}
    </div>
  );
}
