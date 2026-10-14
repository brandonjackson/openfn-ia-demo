import Button from "../Button";

interface Props {
  onClick: () => void;
  canSave?: boolean;
  /** Shows the red dot when there are unsaved changes. */
  hasChanges?: boolean;
  /** "Save", or "Create" on a new workflow. */
  label?: string;
  tooltip?: string;
}

/**
 * The header's Save button (SaveButton in collaborative-editor Header.tsx),
 * with the red "unsaved changes" dot in its corner. The GitHub "Save & Sync"
 * split variant isn't shown: no demo project has a repo connection.
 */
export default function SaveButton({ onClick, canSave = true, hasChanges = false, label = "Save", tooltip = "⌘ S" }: Props) {
  return (
    <div className="relative">
      <Button onClick={onClick} disabled={!canSave} tooltip={tooltip}>
        {label}
      </Button>
      {hasChanges && <div className="absolute top-0 right-0 -m-1 size-3 rounded-full bg-danger-500" data-is-dirty />}
    </div>
  );
}
