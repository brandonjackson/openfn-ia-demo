import { useEffect, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import { Clock, FlaskConical, GitMerge, Lock } from "lucide-react";
import type { WorkflowVersion } from "../../mock-data/workflow";
import { versionOptions } from "../../mock-data/workflow";
import Button from "../Button";
import Picker from "../Picker";
import SegmentedControl from "../SegmentedControl";
import WorkflowFileMenu from "./WorkflowFileMenu";
import type { WorkflowMenuAction } from "./WorkflowFileMenu";
import SandboxChip from "./SandboxChip";
import RunMenuButton from "./RunMenuButton";
import LayoutControls from "./LayoutControls";

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
  /** Whether triggers start runs; the sandbox chip reads this way on main. */
  live?: boolean;
  view: EditorView;
  onViewChange: (view: EditorView) => void;
  retry?: { step?: string; hint?: string };
  onRun?: () => void;
  onRetry?: () => void;
  onRunWithCustomInput?: () => void;
  /** Layout toggles: explorer (code mode only), panel and assistant. */
  explorerOpen?: boolean;
  onToggleExplorer?: () => void;
  panelOpen?: boolean;
  onTogglePanel?: () => void;
  assistantOpen?: boolean;
  onToggleAssistant?: () => void;
}

/**
 * The editor toolbar, in three groups over the canvas.
 *
 * On the left, a pill holds the Fn file menu, the workflow's name (click it,
 * or press R, to rename in a sandbox), the sandbox chip and, when there is
 * history, the version picker. In the middle the view switcher flips between
 * Canvas and Code; on main it's marked read-only. On the right sit the
 * layout toggles (explorer, panel, assistant), the run button and the main
 * action: "Edit in sandbox" on main, "Go live" (promote) in a sandbox.
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
  live = true,
  view,
  onViewChange,
  retry,
  onRun,
  onRetry,
  onRunWithCustomInput,
  explorerOpen,
  onToggleExplorer,
  panelOpen = false,
  onTogglePanel,
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
        ) : (
          <button
            type="button"
            onClick={canRename ? startRenaming : undefined}
            title={canRename ? "Rename (R)" : name}
            className={`mx-2 max-w-[16rem] truncate rounded-md px-1.5 py-0.5 text-sm font-medium text-gray-900 ${
              canRename ? "hover:bg-gray-100" : "cursor-default"
            }`}
          >
            {name}
          </button>
        )}
        <SandboxChip
          sandboxes={sandboxes}
          value={sandbox}
          onChange={onSelectSandbox}
          live={live}
          onNewSandbox={onNewSandbox}
          onViewAll={onViewAllSandboxes}
        />
        {versions.length > 0 && (
          <span className="ml-1.5">
            <Picker
              icon={Clock}
              ariaLabel="Switch version"
              options={versionOptions(versions)}
              value={version}
              onChange={onSelectVersion}
              menuWidthClass="w-80"
              highlight={version !== "latest"}
            />
          </span>
        )}
      </div>

      {/* View switcher */}
      <div className={`${group} px-1.5`}>
        {onMain && (
          <span
            className="mr-1 inline-flex items-center gap-1 px-2 font-mono text-[11px] uppercase tracking-widest text-gray-400"
            title="main is read-only. Edit in a sandbox to make changes."
          >
            <Lock size={11} /> Read-only
          </span>
        )}
        <SegmentedControl variant="pill" size="md" options={editorViews} value={view} onChange={(v) => onViewChange(v as EditorView)} />
      </div>

      {/* Layout, run and the main action */}
      <div className={`${group} gap-1.5 px-1.5`}>
        {onTogglePanel && onToggleAssistant && (
          <>
            <LayoutControls
              explorerOpen={explorerOpen}
              onToggleExplorer={onToggleExplorer}
              panelOpen={panelOpen}
              onTogglePanel={onTogglePanel}
              assistantOpen={assistantOpen}
              onToggleAssistant={onToggleAssistant}
            />
            <span className="mx-0.5 h-6 w-px bg-gray-200" aria-hidden />
          </>
        )}
        <RunMenuButton retry={retry} onRun={onRun} onRetry={onRetry} onRunWithCustomInput={onRunWithCustomInput} />
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
    </div>
  );
}
