import { FlaskConical, Lock } from "lucide-react";

interface Props {
  /**
   * "banner" pins to the bottom of the canvas with a line on how to make
   * changes; "tag" is the bare marker for a corner, e.g. the code pane's.
   */
  variant?: "banner" | "tag";
  /** Opens "Edit in sandbox"; the banner links to it. */
  onEditInSandbox?: () => void;
}

function Marker() {
  return (
    <span className="inline-flex flex-none items-center gap-1 font-mono text-[11px] uppercase tracking-widest text-gray-500">
      <Lock size={11} /> Read-only
    </span>
  );
}

/**
 * Says that main is read-only. On the canvas it's a banner pinned to the
 * bottom, pointing at a sandbox for changes; in the code pane it's a small
 * tag in the top-right corner.
 */
export default function ReadOnlyNotice({ variant = "banner", onEditInSandbox }: Props) {
  if (variant === "tag")
    return (
      <span title="main is read-only. Edit in a sandbox to make changes.">
        <Marker />
      </span>
    );

  return (
    <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-2 text-xs text-gray-600 shadow-sm">
      <Marker />
      <span className="h-4 w-px bg-gray-200" aria-hidden />
      <span>
        To make changes, please edit in a sandbox.
        {onEditInSandbox && (
          <button
            type="button"
            onClick={onEditInSandbox}
            className="ml-1.5 inline-flex items-center gap-1 font-medium text-indigo-600 hover:text-indigo-700 hover:underline"
          >
            <FlaskConical size={12} /> Edit in sandbox
          </button>
        )}
      </span>
    </div>
  );
}
