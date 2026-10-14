import EditorButton from "./EditorButton";

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
      <div className="inline-flex rounded-md shadow-xs z-5">
        <span className="inline-block" title={tooltip}>
          <EditorButton className="cursor-pointer focus:ring-transparent" onClick={onClick} disabled={!canSave}>
            {label}
          </EditorButton>
        </span>
      </div>
      {hasChanges && <div className="absolute -m-1 top-0 right-0 z-10 size-3 bg-danger-500 rounded-full" data-is-dirty />}
    </div>
  );
}
