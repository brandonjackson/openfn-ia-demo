import { Clock, FlaskConical, GitMerge, Lock, Sparkles } from "lucide-react";
import type { Workflow, WorkflowVersion } from "../../mock-data/workflow";
import { versionOptions } from "../../mock-data/workflow";
import Picker from "../Picker";
import Button from "../Button";
import SegmentedControl from "../SegmentedControl";
import RunControl from "./RunControl";
import TrayToggles from "./TrayToggles";
import WorkflowFileMenu from "./WorkflowFileMenu";
import type { FileMenuAction } from "./WorkflowFileMenu";
import type { Dock, EditorMode, TrayId } from "./trays";

const MODES: Record<string, EditorMode> = { Canvas: "canvas", Code: "code" };

/**
 * The editor toolbar, in three parts.
 *
 * Left, a pill holding the "Fn" file menu (which also leads back out of the
 * editor), the workflow's name, and the sandbox and version pickers. The
 * name becomes a text field while `renaming`. The version picker turns
 * yellow while an older version is shown.
 *
 * Centre, the Canvas / Code switch.
 *
 * Right, the panel toggles, the live/run control, the main action ("Edit in
 * sandbox" on main, which is read-only, or "Promote" in a sandbox) and the
 * assistant button (Ctrl/⌘ + K), filled in while the assistant is open.
 */
export default function WorkflowTopBar({
  workflow,
  projectName,
  renaming = false,
  onRename,
  onRenameDone,
  mode = "canvas",
  onModeChange,
  openDocks = { left: false, right: false, bottom: false },
  availableDocks,
  onToggleDock,
  visibleTrays = [],
  onFileAction,
  retry,
  onRun,
  onRetry,
  onRunWithCustomInput,
  url,
  onSeeDetails,
  live = true,
  onToggleLive,
  sandboxes = ["main"],
  sandbox = "main",
  onSelectSandbox,
  onViewAllSandboxes,
  versions = [],
  version = "latest",
  onSelectVersion,
  onEditInSandbox,
  onPromote,
  assistantOpen = false,
  onToggleAssistant,
  defaultFileMenuOpen = false,
}: {
  workflow: Workflow;
  /** For "Back to …" in the file menu. */
  projectName?: string;
  /** Shows the name as a text field. */
  renaming?: boolean;
  onRename?: (name: string) => void;
  onRenameDone?: () => void;
  mode?: EditorMode;
  onModeChange?: (mode: EditorMode) => void;
  openDocks?: Record<Dock, boolean>;
  availableDocks?: Record<Dock, boolean>;
  onToggleDock?: (dock: Dock) => void;
  /** Trays on screen, ticked in the file menu. */
  visibleTrays?: TrayId[];
  onFileAction?: (action: FileMenuAction) => void;
  /** Set while an earlier run is selected; see {@link RunControl}. */
  retry?: { step?: string; hint?: string };
  onRun?: () => void;
  onRetry?: () => void;
  onRunWithCustomInput?: () => void;
  /** The URL that starts the workflow, for "Copy URL". */
  url?: string;
  /** Opens the service listing where the workflow is documented. */
  onSeeDetails?: () => void;
  live?: boolean;
  onToggleLive?: (live: boolean) => void;
  /** Sandboxes of the workflow's project, "main" first. */
  sandboxes?: string[];
  sandbox?: string;
  onSelectSandbox?: (sandbox: string) => void;
  /** Shown as "View all" at the foot of the sandbox picker. */
  onViewAllSandboxes?: () => void;
  /** Version history on main, newest first. */
  versions?: WorkflowVersion[];
  /** "latest" or a version id such as "v1". */
  version?: string;
  onSelectVersion?: (version: string) => void;
  onEditInSandbox?: () => void;
  /** Asks to promote the sandbox's changes to main. */
  onPromote?: () => void;
  assistantOpen?: boolean;
  onToggleAssistant?: () => void;
  /** Start with the file menu open (useful for stories). */
  defaultFileMenuOpen?: boolean;
}) {
  const onMain = sandbox === "main";
  const modeLabel = mode === "canvas" ? "Canvas" : "Code";

  return (
    <div className="relative z-30 grid h-[72px] flex-none grid-cols-[1fr_auto_1fr] items-center gap-4 px-4">
      {/* File menu, name, sandbox and version */}
      <div className="flex min-w-0 items-center">
        <div className="flex h-11 min-w-0 items-center rounded-full border border-gray-200 bg-white pr-2 shadow-sm">
          <WorkflowFileMenu
            projectName={projectName}
            onMain={onMain}
            mode={mode}
            visibleTrays={visibleTrays}
            assistantOpen={assistantOpen}
            live={live}
            onAction={onFileAction}
            defaultOpen={defaultFileMenuOpen}
          />
          <span className="h-full w-px bg-gray-200" />
          {renaming ? (
            <input
              autoFocus
              aria-label="Workflow name"
              defaultValue={workflow.name}
              onFocus={(e) => e.currentTarget.select()}
              onBlur={(e) => {
                onRename?.(e.currentTarget.value.trim() || workflow.name);
                onRenameDone?.();
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") e.currentTarget.blur();
                if (e.key === "Escape") onRenameDone?.();
              }}
              className="mx-2 w-56 rounded-md border border-blue-400 px-2 py-1 text-sm font-medium text-gray-900 outline-none ring-2 ring-blue-100"
            />
          ) : (
            <span className="truncate px-4 text-sm font-medium text-gray-900" title={workflow.name}>
              {workflow.name}
            </span>
          )}
          <div className="flex flex-shrink-0 items-center gap-1.5">
            <Picker
              icon={FlaskConical}
              ariaLabel="Switch sandbox"
              options={sandboxes.map((s) =>
                s === "main" ? { id: s, label: s, icon: Lock, tag: "Read only" } : { id: s, label: s }
              )}
              value={sandbox}
              onChange={onSelectSandbox}
              footerAction={
                onViewAllSandboxes ? { label: "View all", icon: FlaskConical, onClick: onViewAllSandboxes } : undefined
              }
              maxWidthClass="max-w-[14rem]"
            />
            {versions.length > 0 && (
              <Picker
                icon={Clock}
                ariaLabel="Switch version"
                options={versionOptions(versions)}
                value={version}
                onChange={onSelectVersion}
                menuWidthClass="w-80"
                highlight={version !== "latest"}
              />
            )}
          </div>
        </div>
      </div>

      {/* Canvas / Code */}
      <SegmentedControl
        appearance="pill"
        options={Object.keys(MODES)}
        value={modeLabel}
        onChange={(label) => onModeChange?.(MODES[label])}
        titles={{ Canvas: "Canvas (⌘E)", Code: "Code (⌘E)" }}
      />

      {/* Panels and actions */}
      <div className="flex items-center justify-end gap-2">
        <TrayToggles open={openDocks} available={availableDocks} onToggle={onToggleDock} />
        <span className="mx-1 h-5 w-px bg-gray-200" />
        <RunControl
          live={live}
          retry={retry}
          onRun={onRun}
          onRetry={onRetry}
          onRunWithCustomInput={onRunWithCustomInput}
          url={url}
          onSeeDetails={onSeeDetails}
          onToggleLive={onToggleLive}
        />
        {onMain ? (
          <Button variant="dark" size="sm" icon={FlaskConical} onClick={onEditInSandbox} className="rounded-full">
            Edit in sandbox
          </Button>
        ) : (
          <Button variant="dark" size="sm" icon={GitMerge} onClick={onPromote} className="rounded-full">
            Promote
          </Button>
        )}
        <button
          type="button"
          onClick={onToggleAssistant}
          aria-pressed={assistantOpen}
          aria-label={assistantOpen ? "Close AI Assistant" : "Open AI Assistant"}
          title={`${assistantOpen ? "Close" : "Open"} AI Assistant (Ctrl/⌘ + K)`}
          className={`inline-flex h-9 w-9 items-center justify-center rounded-full transition-colors ${
            assistantOpen ? "bg-blue-600 text-white hover:bg-blue-500" : "bg-blue-100 text-blue-600 hover:bg-blue-200"
          }`}
        >
          <Sparkles size={16} />
        </button>
      </div>
    </div>
  );
}
