import { Lock } from "lucide-react";
import type { AdaptorKind } from "../../mock-data/workflow";
import { adaptorVersions } from "../../mock-data/workflow";

export type EditorSaveState = "read-only" | "saved" | "edited";

const stateLabel: Record<EditorSaveState, string> = {
  "read-only": "Read-only",
  saved: "Saved",
  edited: "Unsaved changes",
};

/**
 * The thin bar under the code: the adaptor and file on the left; line count
 * and whether you can edit (and if so, whether it's saved) on the right.
 * `readOnlyReason` explains why it's read-only, e.g. "main is read-only".
 */
export default function EditorStatusBar({
  adaptor,
  file,
  lines,
  state,
  readOnlyReason,
}: {
  adaptor?: AdaptorKind;
  /** The open step's name, or "workflow.yaml". */
  file: string;
  lines: number;
  state: EditorSaveState;
  readOnlyReason?: string;
}) {
  return (
    <div className="flex h-8 flex-none items-center gap-4 whitespace-nowrap border-t border-gray-100 px-3 font-mono text-[11px] text-gray-500">
      {adaptor && <span>{`${adaptor}@${adaptorVersions[adaptor]}`}</span>}
      <span className="min-w-0 truncate">{file}</span>
      <span className="ml-auto">{lines} lines</span>
      <span
        title={state === "read-only" ? readOnlyReason : undefined}
        className={`inline-flex items-center gap-1 ${state === "edited" ? "text-amber-700" : ""}`}
      >
        {state === "read-only" && <Lock size={11} />}
        {stateLabel[state]}
      </span>
    </div>
  );
}
