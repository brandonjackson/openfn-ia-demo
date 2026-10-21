import { useState } from "react";
import {
  ArrowLeft,
  Clock,
  FlaskConical,
  GitMerge,
  Lock,
  MessageSquare,
} from "lucide-react";
import type { Workflow, WorkflowVersion } from "../../mock-data/workflow";
import { versionOptions } from "../../mock-data/workflow";
import Picker from "../Picker";
import Button from "../Button";
import PromoteSandboxModal from "../PromoteSandboxModal";
import RunControl from "./RunControl";

/**
 * The editor top bar: the workflow name, then sandbox and version pickers on
 * the left; the live/run control and the main action on the right.
 *
 * What you can do depends on the sandbox. On main the workflow is read-only
 * and the main action is "Edit in sandbox". In any other sandbox it's
 * "Promote", which opens a dialog to promote the sandbox's changes to main.
 * The version picker turns yellow while an older version is on the canvas.
 *
 * The round chat button at the far right toggles the AI Assistant tray.
 *
 * When `onBack` is provided, a back control is shown in the top-left corner to
 * leave the full-screen editor and return to the app shell.
 */
export default function WorkflowTopBar({
  workflow,
  retry,
  onRun,
  onRetry,
  onRunWithCustomInput,
  url,
  onSeeDetails,
  onBack,
  sandboxes = ["main"],
  sandbox = "main",
  onSelectSandbox,
  onViewAllSandboxes,
  versions = [],
  version = "latest",
  onSelectVersion,
  onEditInSandbox,
  onPromote,
  defaultPromoteOpen = false,
  defaultLive = true,
  assistantOpen = false,
  onToggleAssistant,
}: {
  workflow: Workflow;
  /** Set while an earlier run is selected; see {@link RunControl}. */
  retry?: { step?: string; hint?: string };
  onRun?: () => void;
  onRetry?: () => void;
  onRunWithCustomInput?: () => void;
  /** The URL that starts the workflow, for "Copy URL". */
  url?: string;
  /** Opens the service listing where the workflow is documented. */
  onSeeDetails?: () => void;
  onBack?: () => void;
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
  /** Called with the version message once a promotion is confirmed. */
  onPromote?: (message: string) => void;
  /** Start with the promote dialog open (useful for stories). */
  defaultPromoteOpen?: boolean;
  /** Whether the workflow starts out live. */
  defaultLive?: boolean;
  /** Whether the AI Assistant tray is open; the chat button fills in while it is. */
  assistantOpen?: boolean;
  onToggleAssistant?: () => void;
}) {
  const [promoteOpen, setPromoteOpen] = useState(defaultPromoteOpen);
  const [live, setLive] = useState(defaultLive);
  const onMain = sandbox === "main";

  return (
    <div className="flex items-center justify-between gap-4 border-b border-gray-200 bg-white px-4 py-2.5">
      {/* Workflow, sandbox and version */}
      <div className="flex items-center gap-2 text-sm min-w-0">
        {onBack && (
          <button
            onClick={onBack}
            title="Back to app"
            aria-label="Back to app"
            className="inline-flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-900"
          >
            <ArrowLeft size={16} />
          </button>
        )}
        <span className="font-medium text-gray-900 truncate">{workflow.name}</span>
        <Picker
          icon={FlaskConical}
          ariaLabel="Switch sandbox"
          options={sandboxes.map((s) =>
            s === "main" ? { id: s, label: s, icon: Lock, tag: "Read only" } : { id: s, label: s }
          )}
          value={sandbox}
          onChange={onSelectSandbox}
          footerAction={
            onViewAllSandboxes
              ? { label: "View all", icon: FlaskConical, onClick: onViewAllSandboxes }
              : undefined
          }
          maxWidthClass="max-w-[14rem]"
        />
        <Picker
          icon={Clock}
          ariaLabel="Switch version"
          options={versionOptions(versions)}
          value={version}
          onChange={onSelectVersion}
          menuWidthClass="w-80"
          highlight={version !== "latest"}
        />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <RunControl
          live={live}
          retry={retry}
          onRun={onRun}
          onRetry={onRetry}
          onRunWithCustomInput={onRunWithCustomInput}
          url={url}
          onSeeDetails={onSeeDetails}
          onToggleLive={setLive}
        />
        {onMain ? (
          <Button variant="outline-primary" size="sm" icon={FlaskConical} onClick={onEditInSandbox}>
            Edit in sandbox
          </Button>
        ) : (
          <Button variant="dark" size="sm" icon={GitMerge} onClick={() => setPromoteOpen(true)}>
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
          <MessageSquare size={16} />
        </button>
      </div>

      <PromoteSandboxModal
        open={promoteOpen && !onMain}
        onClose={() => setPromoteOpen(false)}
        sandbox={sandbox}
        workflowName={workflow.name}
        nextVersion={`v${versions.length + 1}`}
        onPromote={(message) => {
          setPromoteOpen(false);
          onPromote?.(message);
        }}
      />
    </div>
  );
}
