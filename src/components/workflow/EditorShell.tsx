import type { ReactNode } from "react";
import type { EditorMode } from "./trays";
import { CANVAS_BACKGROUND } from "./WorkflowCanvas";

/**
 * The outermost frame of the workflow editor: the toolbar over the editor's
 * docks and main surface, with the assistant down the right-hand side.
 *
 * On the canvas the whole frame wears the canvas's dotted background, so the
 * toolbar and trays float over the diagram; in code it's a quiet grey, with
 * the code and its trays in one card.
 */
export default function EditorShell({
  mode,
  toolbar,
  assistant,
  children,
}: {
  mode: EditorMode;
  toolbar: ReactNode;
  /** The assistant tray, beside everything else. */
  assistant?: ReactNode;
  /** The editor's docks and main surface, usually an {@link EditorLayout}. */
  children: ReactNode;
}) {
  return (
    <div className={`flex h-full ${mode === "canvas" ? CANVAS_BACKGROUND : "bg-gray-50"}`}>
      <div className="flex min-w-0 flex-1 flex-col">
        {toolbar}
        {children}
      </div>
      {assistant}
    </div>
  );
}
