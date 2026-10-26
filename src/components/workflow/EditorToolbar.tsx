import { useEffect, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import { FlaskConical, GitMerge, Sparkles } from "lucide-react";
import type { RunDetails, WorkflowVersion } from "../../mock-data/workflow";
import { versionOptions } from "../../mock-data/workflow";
import Button from "../Button";
import Picker from "../Picker";
import SegmentedControl from "../SegmentedControl";
import IconToggleButton from "../IconToggleButton";
import WorkflowFileMenu from "./WorkflowFileMenu";
import type { WorkflowMenuAction } from "./WorkflowFileMenu";
import SandboxChip from "./SandboxChip";
import RunMenuButton from "./RunMenuButton";
import LoadedRunBar from "./LoadedRunBar";

/** The editor's main surfaces. */
export type EditorView = "canvas" | "code";

const editorViews: { id: EditorView; label: string }[] = [
  { id: "canvas", label: "Canvas" },
  { id: "code", label: "Code" },
];

interface Props {
  name: string;
  onRename?: (name: string) => void;
  /** Start in rename mode (useful for stories). */
  defaultRenaming?: boolean;
  onMenuAction: (action: WorkflowMenuAction) => void;
  projectName?: string;
  url?: string;
  hasDetails?: boolean;
  /** Sandboxes of the project, "main" first. */
  sandboxes?: string[];
  sandbox?: string;
  onSelectSandbox?: (sandbox: string) => void;
  onNewSandbox?: () => void;
  onViewAllSandboxes?: () => void;
  /** Version history on main, newest first. */
  versions?: WorkflowVersion[];
  /** "latest" or a version id such as "v1". */
  version?: string;
  onSelectVersion?: (version: string) => void;
  /** A loaded run; in code mode it shows next to the view switcher, with "Unload run". */
  run?: RunDetails;
  onCloseRun?: () => void;
  /** Whether triggers start runs; the sandbox chip reads this way on main. */
  live?: boolean;
  view: EditorView;
  onViewChange: (view: EditorView) => void;
  retry?: { step?: string; hint?: string };
  /** The step in focus, for "Run from here". */
  fromStep?: string;
  onRun?: () => void;
  onRunFromStep?: () => void;
  onRetry?: () => void;
  onRunWithCustomInput?: () => void;
  /**
   * The assistant button, in its own group at the far right. It opens the
   * assistant and steps aside while it is open; the tray's close button
   * closes it.
   */
  assistantOpen?: boolean;
  onToggleAssistant?: () => void;
}

/**
 * The editor toolbar, in three groups over the canvas.
 *
 * On the left, a pill holds the Fn file menu, the workflow's title and the
 * sandbox chip. The title reads "Name • v4": click it to open the version
 * history (renaming lives in the Fn menu, or press R in a sandbox). While a
 * run is loaded, the title is just the name. In the middle the view switcher
 * flips between Canvas and Code. In code mode a
 * loaded run sits to its right, styled like the canvas runs bar, with
 * "Unload run". On the right sit the run
 * button and the main action ("Edit in sandbox" on main, "Go live" in a
 * sandbox), then the assistant button in a group of its own. The button hands
 * over to the assistant tray: while the tray slides in from the right, the
 * button folds away in step with it, and it comes back as the tray leaves, so
 * the tray's own close button is the way to close the assistant. Showing and
 * hiding the other areas is the ⋯ layout menu's job, not the toolbar's.
 */
export default function EditorToolbar({
  name,
  onRename,
  defaultRenaming = false,
  onMenuAction,
  projectName,
  url,
  hasDetails,
  sandboxes = ["main"],
  sandbox = "main",
  onSelectSandbox,
  onNewSandbox,
  onViewAllSandboxes,
  versions = [],
  version = "latest",
  onSelectVersion,
  run,
  onCloseRun,
  live = true,
  view,
  onViewChange,
  retry,
  fromStep,
  onRun,
  onRunFromStep,
  onRetry,
  onRunWithCustomInput,
  assistantOpen = false,
  onToggleAssistant,
}: Props) {
  const onMain = sandbox === "main";
  const canRename = !onMain && onRename !== undefined;
  const [renaming, setRenaming] = useState(defaultRenaming && canRename);
  const [draft, setDraft] = useState(name);
  const inputRef = useRef<HTMLInputElement>(null);

  const startRenaming = () => {
    setDraft(name);
    setRenaming(true);
  };

  useEffect(() => {
    if (renaming) inputRef.current?.select();
  }, [renaming]);

  // R renames, as the menu's shortcut hint promises, unless you're typing.
  useEffect(() => {
    if (!canRename) return;
    const onKey = (e: globalThis.KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const typing = target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable);
      if (e.key.toLowerCase() === "r" && !e.metaKey && !e.ctrlKey && !e.altKey && !typing) {
        e.preventDefault();
        setDraft(name);
        setRenaming(true);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [canRename, name]);

  const commitRename = () => {
    const next = draft.trim();
    if (next && next !== name) onRename?.(next);
    setRenaming(false);
  };

  const onRenameKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") commitRename();
    if (e.key === "Escape") setRenaming(false);
  };

  const menuAction = (action: WorkflowMenuAction) => {
    if (action === "rename") {
      if (canRename) startRenaming();
      return;
    }
    onMenuAction(action);
  };

  const group = "flex h-10 items-center rounded-xl border border-gray-200 bg-white shadow-sm";

  return (
    <div className="flex items-center justify-between gap-3">
      {/* Workflow: file menu, name, sandbox, version */}
      <div className={`${group} min-w-0 pr-2`}>
        <WorkflowFileMenu
          onSelect={menuAction}
          onMain={onMain}
          live={live}
          projectName={projectName}
          url={url}
          hasDetails={hasDetails}
        />
        <span className="h-6 w-px bg-gray-200" aria-hidden />
        {renaming ? (
          <input
            ref={inputRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commitRename}
            onKeyDown={onRenameKey}
            aria-label="Workflow name"
            className="mx-2 h-7 w-56 rounded-md border border-blue-300 bg-blue-50/40 px-2 text-sm text-gray-900 outline-none ring-2 ring-blue-100"
          />
        ) : versions.length > 0 && !run ? (
          <span className="mx-1.5 min-w-0">
            <Picker
              ariaLabel="Switch version"
              options={versionOptions(versions)}
              value={version}
              onChange={onSelectVersion}
              menuWidthClass="w-80"
              maxWidthClass="max-w-[20rem]"
              trigger={(selected) => (
                <>
                  <span className="truncate font-semibold text-gray-900">{name}</span>
                  <span className="text-gray-300" aria-hidden>
                    •
                  </span>
                  <span
                    className={`flex-none font-mono text-xs ${
                      version !== "latest" ? "rounded bg-amber-100 px-1 text-amber-800" : "text-gray-500"
                    }`}
                  >
                    {selected?.shortLabel ?? version}
                  </span>
                </>
              )}
            />
          </span>
        ) : (
          <span className="mx-2 min-w-[4rem] max-w-[16rem] truncate px-1.5 text-sm font-semibold text-gray-900" title={name}>
            {name}
          </span>
        )}
        <SandboxChip
          sandboxes={sandboxes}
          value={sandbox}
          onChange={onSelectSandbox}
          live={live}
          onNewSandbox={onNewSandbox}
          onViewAll={onViewAllSandboxes}
        />
      </div>

      {/* View switcher, then the loaded run in code mode (the canvas has its own runs bar) */}
      <div className="flex flex-none items-center gap-3">
      <div className={`${group} px-1.5`}>
        <SegmentedControl variant="pill" size="md" options={editorViews} value={view} onChange={(v) => onViewChange(v as EditorView)} />
      </div>
      {run && view === "code" && <LoadedRunBar run={run} detail={run.version} onUnload={onCloseRun} />}
      </div>

      {/* Run and the main action, then the assistant on its own; these never shrink, the name and sandbox truncate instead */}
      <div className="flex flex-none items-center gap-3">
      <div className={`${group} gap-1.5 px-1.5`}>
        <RunMenuButton
          retry={retry}
          fromStep={fromStep}
          onRun={onRun}
          onRunFromStep={onRunFromStep}
          onRetry={onRetry}
          onRunWithCustomInput={onRunWithCustomInput}
        />
        {onMain ? (
          <Button variant="dark" size="sm" icon={FlaskConical} className="ml-1 rounded-lg" onClick={() => onMenuAction("edit-in-sandbox")}>
            Edit in sandbox
          </Button>
        ) : (
          <Button variant="dark" size="sm" icon={GitMerge} className="ml-1 rounded-lg" onClick={() => onMenuAction("promote")}>
            Go live
          </Button>
        )}
      </div>
      {onToggleAssistant && (
        // Folds to nothing (taking the gap before it along) on the same
        // timing as the tray's slide, so the toolbar's right edge glides.
        <div
          inert={assistantOpen}
          aria-hidden={assistantOpen}
          className={`flex-none overflow-hidden transition-[max-width,margin,opacity] duration-300 ease-out motion-reduce:transition-none ${
            assistantOpen ? "-ml-3 max-w-0 opacity-0" : "max-w-16 opacity-100"
          }`}
        >
          <div className={`${group} px-1`}>
            <IconToggleButton icon={Sparkles} label="Assistant" hint="Ctrl/⌘ + K" onClick={onToggleAssistant} />
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
