import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import type { Project } from "../../mock-data/projects";
import type { WorkflowSnapshot } from "../../mock-data/workflow";
import PickerButton from "../PickerButton";
import { projectLabel } from "../projectPickerItems";
import Toggle from "../Toggle";
import AIButton from "./AIButton";
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

function Chevron() {
  return <span className="hero-chevron-right-mini w-5 h-5 text-secondary-500" />;
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
  const isSandbox = project.parentId !== null;
  return (
    <div className="flex-none bg-white shadow-xs border-b border-gray-200 relative z-50">
      <div className="mx-auto sm:px-4 lg:px-4 py-6 flex items-center h-20 text-sm gap-2">
        <div className="flex min-w-0 items-center">
          <nav className="flex" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-2">
              <li className="flex items-center mr-3 shrink-0 whitespace-nowrap">
                <PickerButton label={projectLabel(project)} isSandbox={isSandbox} color={project.color} />
              </li>
              <li className="flex items-center">
                <Link
                  to={`/projects/${project.id}/w`}
                  className="text-gray-400 hover:text-gray-500 flex items-center cursor-pointer whitespace-nowrap"
                >
                  <span className="font-medium text-gray-500">Workflows</span>
                </Link>
              </li>
              <Chevron />
              <li className="flex items-center">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={onTitleClick}
                    className="text-gray-400 hover:text-gray-500 flex items-center cursor-pointer min-w-0"
                    title={workflowName}
                  >
                    <span className="font-medium text-gray-500 block max-w-[16rem] truncate">{workflowName}</span>
                  </button>
                  <div className="flex items-center gap-1.5">
                    <VersionDropdown
                      snapshots={snapshots}
                      pinnedVersion={pinnedVersion}
                      onVersionSelect={onVersionSelect}
                    />
                  </div>
                </div>
              </li>
            </ol>
          </nav>
        </div>
        {children}
        <div className="grow ml-2" />

        <div className="flex flex-row gap-2 items-center">
          <div className="flex flex-row gap-2 items-center">
            <span className="inline-flex items-center" title={enabled ? "Disable workflow" : "Enable workflow"}>
              <Toggle checked={enabled} onChange={onEnabledChange} />
            </span>
            <div>
              <button
                type="button"
                onClick={onSettingsClick}
                aria-pressed={settingsOpen}
                aria-label="Workflow settings"
                className="w-6 h-6 place-self-center text-slate-500 hover:text-slate-400 cursor-pointer"
              >
                <span className="hero-adjustments-vertical" />
              </button>
            </div>
          </div>
          <div className="relative flex gap-2">
            {canRun && (
              <NewRunButton onClick={onRun} onRunWithCustomInputClick={onRunWithCustomInput} disabled={runDisabled} />
            )}
            <SaveButton onClick={onSave} hasChanges={hasChanges} label={saveLabel} />
          </div>
        </div>

        <AIButton className="ml-2" isOpen={aiOpen} onClick={onAIClick} />
      </div>
    </div>
  );
}
