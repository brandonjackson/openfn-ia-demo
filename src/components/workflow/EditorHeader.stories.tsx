import type { Meta, StoryObj } from "@storybook/react";
import { projects } from "../../mock-data/projects";
import { findWorkflowGraph, snapshotsOf } from "../../mock-data/workflow";
import { withRouter } from "../../stories/decorators";
import EditorHeader from "./EditorHeader";

const graph = findWorkflowGraph("wf-openhie")!;
const noop = () => {};

const meta: Meta<typeof EditorHeader> = {
  title: "Workflow/EditorHeader",
  component: EditorHeader,
  decorators: [withRouter],
  parameters: { layout: "fullscreen" },
  args: {
    project: projects[0],
    workflowName: graph.name,
    snapshots: snapshotsOf(graph),
    pinnedVersion: null,
    onVersionSelect: noop,
    onTitleClick: noop,
    enabled: false,
    onEnabledChange: noop,
    settingsOpen: false,
    onSettingsClick: noop,
    canRun: true,
    onRun: noop,
    onRunWithCustomInput: noop,
    hasChanges: false,
    onSave: noop,
    aiOpen: false,
    onAIClick: noop,
  },
};
export default meta;
type Story = StoryObj<typeof EditorHeader>;

export const Default: Story = {};
export const EnabledWithUnsavedChanges: Story = { args: { enabled: true, hasChanges: true } };
export const PinnedVersion: Story = { args: { pinnedVersion: 10 } };
export const IDEOpen: Story = { args: { runDisabled: true } };
export const Sandbox: Story = {
  args: { project: projects.find((p) => p.parentId !== null) ?? projects[0], workflowName: "OpenHIE Workflow" },
};
