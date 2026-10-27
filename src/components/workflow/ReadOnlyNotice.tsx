import { FlaskConical, Lock } from "lucide-react";
import Surface from "../Surface";

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
    <span className="inline-flex flex-none items-center gap-1.5 font-mono text-[11px] uppercase leading-none tracking-widest text-gray-500">
      <Lock size={12} className="flex-none" />
      <span className="translate-y-px">Read-only</span>
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
    <Surface className="flex items-center gap-3 px-4 py-2 text-xs leading-none text-gray-600">
      <Marker />
      <span className="h-4 w-px flex-none bg-gray-200" aria-hidden />
      <span>To make changes, please edit in a sandbox.</span>
      {onEditInSandbox && (
        <button
          type="button"
          onClick={onEditInSandbox}
          className="-ml-1 inline-flex flex-none items-center gap-1 font-medium leading-none text-indigo-600 hover:text-indigo-700 hover:underline"
        >
          <FlaskConical size={12} className="flex-none" />
          <span>Edit in sandbox</span>
        </button>
      )}
    </Surface>
  );
}
