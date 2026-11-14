import { useEffect, useRef, useState } from "react";
import type { KeyboardEvent, ReactNode } from "react";
import { FlaskConical, Sparkles } from "lucide-react";
import type { RunDetails, WorkflowVersion } from "../../model/workflow";
import type { WorkflowChange } from "../../model/workflow-changes";
import { versionOptions } from "../../model/workflow";
import Button from "../primitives/Button";
import Picker from "../primitives/Picker";
import SegmentedControl from "../primitives/SegmentedControl";
import IconButton from "../primitives/IconButton";
import LoadingState from "../primitives/LoadingState";
import WorkflowFileMenu from "./WorkflowFileMenu";
import type { WorkflowMenuAction } from "./WorkflowFileMenu";
import SandboxChip from "./SandboxChip";
import RunMenuButton from "./RunMenuButton";
import LoadedRunBar from "./LoadedRunBar";
import TriggerStatusMenu from "./TriggerStatusMenu";

/** The editor's main surfaces. */
export type EditorView = "canvas" | "code";

const editorViews: { id: EditorView; label: string }[] = [
  { id: "canvas", label: "Canvas" },
  { id: "code", label: "Explorer" },
];

interface Props {
  name: string;
  /**
   * The workflow is still on its way: the bar shows the Fn button, which
   * doesn't open yet, and a spinner where the name goes, and nothing else,
   * so the editor's frame is there from the start and fills in as it loads.
   */
  loading?: boolean;
  /** Renames the workflow. Leave it out where it can't be renamed, e.g. on main. */
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
  /** In a sandbox, what its copy changes: the sandbox chip counts them and lists them. */
  changes?: WorkflowChange[];
  /** The environment the sandbox (or main) loads credentials from, for the Live/Paused panel. */
  environment?: string;
  /** Whether the project has environment variables, which the Live/Paused panel then lists among what runs use. */
  showEnvVars?: boolean;
  /** Whether the trigger starts runs here: "Live" or "Paused", left of Run. */
  live?: boolean;
  /** Turns the trigger on or off, from the Live/Paused panel. Left out where you can't. */
  onToggleLive?: (live: boolean) => void;
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
  /**
   * Lays the groups out. The bar's frame is a pattern (`EditorTopBar`), so
   * the page draws it and fills its slots with these.
   */
  children: (groups: EditorToolbarGroups) => ReactNode;
}

/** The toolbar's groups of controls, for the page to put in `EditorTopBar`'s slots. */
export interface EditorToolbarGroups {
  /** The file menu, the workflow's name (or version picker), and the sandbox chip: main with a lock, or the sandbox with its changes. */
  start: ReactNode;
  /** The Canvas/Code switcher. */
  middle: ReactNode;
  /** The loaded run, beside the switcher in code mode. */
  afterMiddle?: ReactNode;
  /** Live or Paused and Run, with Edit in sandbox on main. */
  end: ReactNode;
  /** The assistant's toggle. */
  aside?: ReactNode;
  /** Hide the assistant's toggle while the assistant is open. */
  asideHidden: boolean;
}

/**
 * The editor toolbar, in three groups over the canvas.
 *
 * On the left, a pill holds the Fn file menu, the workflow's title and the
 * sandbox chip. The title reads "Name • v4": click it to open
 * the version history (renaming lives in the Fn menu, or press R in a
 * sandbox). While a run is loaded, the title is just the name. On main the
 * chip reads "main" with a lock; in a sandbox it's amber, counts what's
 * changed and its panel lists the changes, with "Create promotion request",
 * above the sandboxes to switch to. In the
 * middle the view switcher flips between Canvas and Explorer. In the explorer
 * a loaded run sits to its right, styled like the canvas runs bar, with
 * "Unload run". On the right sit Live or Paused (whether the trigger starts
 * runs here; its panel holds the switch and what runs here use) and Run, which is the main action
 * in a sandbox; on main "Edit in sandbox" is, after Run. Then the assistant
 * button in a group of its own. The button hands
 * over to the assistant tray: while the tray slides in from the right, the
 * button folds away in step with it, and it comes back as the tray leaves, so
 * the tray's own close button is the way to close the assistant. Showing and
 * hiding the other areas is the ⋯ layout menu's job, not the toolbar's.
 */
export default function EditorToolbar({
  name,
  loading = false,
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
  changes = [],
  environment,
  showEnvVars = false,
  live = true,
  onToggleLive,
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
  children,
}: Props) {
  const onMain = sandbox === "main";
  const canRename = onRename !== undefined;
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

  return children({
      start: (
        <>
          <WorkflowFileMenu
            onSelect={menuAction}
            onMain={onMain}
            canRename={canRename}
            live={live}
            projectName={projectName}
            url={url}
            hasDetails={hasDetails}
            disabled={loading}
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
              className="mx-2 h-7 w-56 rounded-md border border-indigo-300 bg-indigo-50/40 px-2 text-sm text-gray-900 outline-none ring-2 ring-indigo-100"
            />
          ) : versions.length > 0 && !run && !loading ? (
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
                        version !== "latest" ? "rounded bg-badge-yellow-bg px-1 text-badge-yellow-fg" : "text-gray-500"
                      }`}
                    >
                      {selected?.shortLabel ?? version}
                    </span>
                  </>
                )}
              />
            </span>
          ) : (
            <div className="mx-2 min-w-[4rem] max-w-[16rem] truncate px-1.5 text-sm font-semibold text-gray-900" title={loading ? undefined : name}>
              {loading ? <LoadingState size="inline" label="Loading workflow…" /> : name}
            </div>
          )}
          {!loading && (
            <SandboxChip
              sandboxes={sandboxes}
              value={sandbox}
              onChange={onSelectSandbox}
              changes={changes}
              onPromote={() => onMenuAction("promote")}
              onNewSandbox={onNewSandbox}
              onViewAll={onViewAllSandboxes}
            />
          )}
        </>
      ),
      middle: loading ? undefined : (
        <SegmentedControl variant="pill" size="md" options={editorViews} value={view} onChange={(v) => onViewChange(v as EditorView)} />
      ),
      // The loaded run sits beside the switcher in code mode; the canvas has its own runs bar.
      afterMiddle: run && view === "code" ? <LoadedRunBar run={run} detail={run.version} onUnload={onCloseRun} /> : undefined,
      end: loading ? undefined : (
        <>
          <TriggerStatusMenu sandbox={sandbox} live={live} onToggle={onToggleLive} environment={environment} showEnvVars={showEnvVars} />
          <RunMenuButton
            primary={!onMain}
            retry={retry}
            fromStep={fromStep}
            onRun={onRun}
            onRunFromStep={onRunFromStep}
            onRetry={onRetry}
            onRunWithCustomInput={onRunWithCustomInput}
          />
          {onMain && (
            <Button variant="dark" size="sm" icon={FlaskConical} className="ml-1 rounded-lg" onClick={() => onMenuAction("edit-in-sandbox")}>
              Edit in sandbox
            </Button>
          )}
        </>
      ),
      aside: onToggleAssistant && !loading ? (
        <IconButton variant="toggle" size="md" icon={Sparkles} label="Assistant" hint="Ctrl/⌘ + K" onClick={onToggleAssistant} />
      ) : undefined,
      // Folds away while the assistant is open, since its own header closes it.
      asideHidden: assistantOpen,
  });
}
