import type { ReactNode } from "react";
import type { Project } from "../../mock-data/projects";
import type { WorkflowSnapshot } from "../../mock-data/workflow";
import IconButton from "../IconButton";
import ProjectBreadcrumbs from "../ProjectBreadcrumbs";
import Toggle from "../Toggle";
import NewRunButton from "./NewRunButton";
import SaveButton from "./SaveButton";
import VersionDropdown from "./VersionDropdown";

interface Props {
  project: Project;
  workflowName: string;
  snapshots: WorkflowSnapshot[];
  pinnedVersion: number | null;
  onVersionSelect: (version: number | "latest") => void;
  /** Clicking the workflow name closes every panel and returns to the bare canvas. */
  onTitleClick: () => void;
  enabled: boolean;
  onEnabledChange: (enabled: boolean) => void;
  settingsOpen: boolean;
  onSettingsClick: () => void;
  /** Hidden when the workflow has no trigger to start a run from. */
  canRun: boolean;
  runDisabled?: boolean;
  onRun: () => void;
  onRunWithCustomInput: () => void;
  hasChanges: boolean;
  onSave: () => void;
  saveLabel?: string;
  aiOpen: boolean;
  onAIClick: () => void;
  /** Extra content after the breadcrumbs (e.g. a "Read-only" pill). */
  children?: ReactNode;
}

/**
 * The collaborative editor's header bar (collaborative-editor/components/
 * Header.tsx + BreadcrumbContent in CollaborativeEditor.tsx): project picker,
 * Workflows, the workflow name with its version pill; then the enabled
 * switch, the settings icon, the split Run button, Save and the AI button.
 * This is the "no experimental features" layout Lightning shows by default.
 */
export default function EditorHeader({
  project,
  workflowName,
  snapshots,
  pinnedVersion,
  onVersionSelect,
  onTitleClick,
  enabled,
  onEnabledChange,
  settingsOpen,
  onSettingsClick,
  canRun,
  runDisabled = false,
  onRun,
  onRunWithCustomInput,
  hasChanges,
  onSave,
  saveLabel = "Save",
  aiOpen,
  onAIClick,
  children,
}: Props) {
  return (
    <div className="relative z-50 flex-none border-b border-gray-200 bg-white shadow-xs">
      <div className="mx-auto flex h-20 items-center gap-2 py-6 text-sm sm:px-4">
        <div className="flex min-w-0 items-center">
          <ProjectBreadcrumbs
            project={project}
            items={[["Workflows", `/projects/${project.id}/w`]]}
            current={
              <span className="flex items-center gap-2">
                <button type="button" onClick={onTitleClick} title={workflowName} className="block max-w-[16rem] truncate hover:text-gray-700">
                  {workflowName}
                </button>
                <VersionDropdown snapshots={snapshots} pinnedVersion={pinnedVersion} onVersionSelect={onVersionSelect} />
              </span>
            }
          />
        </div>
        {children}
        <div className="ml-2 grow" />

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center" title={enabled ? "Disable workflow" : "Enable workflow"}>
            <Toggle checked={enabled} onChange={onEnabledChange} />
          </span>
          <IconButton icon="hero-adjustments-vertical" label="Workflow settings" active={settingsOpen} aria-pressed={settingsOpen} onClick={onSettingsClick} />
          {canRun && <NewRunButton onClick={onRun} onRunWithCustomInputClick={onRunWithCustomInput} disabled={runDisabled} />}
          <SaveButton onClick={onSave} hasChanges={hasChanges} label={saveLabel} />
        </div>

        <IconButton
          icon="hero-chat-bubble-left-right"
          label={aiOpen ? "Close AI Assistant" : "Open AI Assistant"}
          title={`${aiOpen ? "Close AI Assistant" : "Open AI Assistant"} (⌘ K)`}
          active={aiOpen}
          size="lg"
          className="ml-2 rounded-full"
          onClick={onAIClick}
        />
      </div>
    </div>
  );
}
