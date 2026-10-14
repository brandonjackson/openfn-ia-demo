import type { SandboxRow } from "../../../mock-data/sandboxes";
import Button from "../../Button";
import IconButton from "../../IconButton";
import BranchesIcon from "./BranchesIcon";

/**
 * The icon buttons on a sandbox card (SandboxLive.Components.sandbox_actions):
 * Merge, Edit and Delete, greyed with a "not authorized" tooltip when the
 * user can't. A sandbox scheduled for deletion gets a Restore button instead.
 */
export default function SandboxActions({
  sandbox,
  onMerge,
  onEdit,
  onDelete,
  onRestore,
}: {
  sandbox: SandboxRow;
  onMerge?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onRestore?: () => void;
}) {
  if (sandbox.scheduledDeletion) {
    return (
      <div id={`cancel-deletion-sandbox-${sandbox.id}`}>
        <Button
          theme="secondary"
          disabled={!sandbox.canDelete}
          tooltip={sandbox.canDelete ? undefined : "You are not authorized to cancel deletion of this sandbox"}
          onClick={onRestore}
        >
          Restore
        </Button>
      </div>
    );
  }
  const mergeLabel = sandbox.canMerge ? "Merge this sandbox" : "You are not authorized to merge this sandbox";
  return (
    <div className="flex gap-1">
      {/* IconButton only takes a hero class, and Merge uses Lightning's own branches icon. */}
      <span id={`branch-rewire-sandbox-${sandbox.id}`} title={mergeLabel}>
        <button
          type="button"
          aria-label={mergeLabel}
          disabled={!sandbox.canMerge}
          onClick={onMerge}
          className="rounded-md p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <BranchesIcon className="h-5 w-5" />
        </button>
      </span>
      <span id={`edit-sandbox-${sandbox.id}`}>
        <IconButton
          icon="hero-pencil-square"
          label={sandbox.canEdit ? "Edit this sandbox" : "You are not authorized to edit this sandbox"}
          disabled={!sandbox.canEdit}
          onClick={onEdit}
        />
      </span>
      <span id={`delete-sandbox-${sandbox.id}`}>
        <IconButton
          icon="hero-trash"
          label={sandbox.canDelete ? "Delete this sandbox" : "You are not authorized to delete this sandbox"}
          disabled={!sandbox.canDelete}
          onClick={onDelete}
        />
      </span>
    </div>
  );
}
