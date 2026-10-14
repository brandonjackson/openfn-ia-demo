import type { ReactNode } from "react";
import type { SandboxRow } from "../../../mock-data/sandboxes";
import { cn } from "../../../utils/cn";
import Button from "../../Button";
import BranchesIcon from "./BranchesIcon";

function ActionButton({
  id,
  label,
  disabled,
  onClick,
  children,
}: {
  id: string;
  label: string;
  disabled: boolean;
  onClick?: () => void;
  children: (iconClass: string) => ReactNode;
}) {
  return (
    <span id={id} className="inline-block" title={label} aria-label={label}>
      <button
        type="button"
        className={cn(
          "rounded-lg p-2 transition-colors flex items-center justify-center",
          disabled ? "cursor-not-allowed" : "hover:bg-slate-100"
        )}
        onClick={(e) => {
          e.stopPropagation();
          if (!disabled) onClick?.();
        }}
        disabled={disabled}
        aria-disabled={disabled}
      >
        {children(cn("h-4 w-4", disabled ? "text-slate-300" : "text-slate-700"))}
      </button>
    </span>
  );
}

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
      <div id={`cancel-deletion-sandbox-${sandbox.id}`} className="flex-shrink-0 ml-4">
        <Button
          theme="secondary"
          disabled={!sandbox.canDelete}
          tooltip={sandbox.canDelete ? undefined : "You are not authorized to cancel deletion of this sandbox"}
          onClick={(e) => {
            e.stopPropagation();
            onRestore?.();
          }}
        >
          Restore
        </Button>
      </div>
    );
  }
  return (
    <div className="flex gap-1 flex-shrink-0 ml-4">
      <ActionButton
        id={`branch-rewire-sandbox-${sandbox.id}`}
        label={sandbox.canMerge ? "Merge this sandbox" : "You are not authorized to merge this sandbox"}
        disabled={!sandbox.canMerge}
        onClick={onMerge}
      >
        {(c) => <BranchesIcon className={c} />}
      </ActionButton>
      <ActionButton
        id={`edit-sandbox-${sandbox.id}`}
        label={sandbox.canEdit ? "Edit this sandbox" : "You are not authorized to edit this sandbox"}
        disabled={!sandbox.canEdit}
        onClick={onEdit}
      >
        {(c) => <span className={cn("hero-pencil-square", c)} />}
      </ActionButton>
      <ActionButton
        id={`delete-sandbox-${sandbox.id}`}
        label={sandbox.canDelete ? "Delete this sandbox" : "You are not authorized to delete this sandbox"}
        disabled={!sandbox.canDelete}
        onClick={onDelete}
      >
        {(c) => <span className={cn("hero-trash", c)} />}
      </ActionButton>
    </div>
  );
}
