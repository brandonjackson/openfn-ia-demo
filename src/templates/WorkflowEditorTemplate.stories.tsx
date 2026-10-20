import type { Meta, StoryObj } from "@storybook/react";
import WorkflowEditorTemplate from "./WorkflowEditorTemplate";
import { nationalIdWorkflow, recentHistory, workflowVersions } from "../mock-data/workflow";
import { projects } from "../mock-data/projects";

const meta: Meta<typeof WorkflowEditorTemplate> = {
  title: "Templates/WorkflowEditorTemplate",
  component: WorkflowEditorTemplate,
  parameters: { layout: "fullscreen" },
  args: { sandboxes: projects[0].sandboxes, versions: workflowVersions },
  decorators: [
    (Story) => (
      <div style={{ height: "100vh" }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof WorkflowEditorTemplate>;

export const Default: Story = {
  args: { workflow: nationalIdWorkflow, history: recentHistory },
};

export const WithBackButton: Story = {
  args: {
    workflow: nationalIdWorkflow,
    history: recentHistory,
    onBack: () => {},
  },
};

export const WithJobSelected: Story = {
  args: {
    workflow: nationalIdWorkflow,
    history: recentHistory,
    initialSelectedId: "search",
  },
};

export const JobExpanded: Story = {
  name: "Job expanded (code editor)",
  args: {
    workflow: nationalIdWorkflow,
    history: recentHistory,
    initialSelectedId: "search",
    initialExpandedId: "search",
  },
};

export const InSandbox: Story = {
  args: {
    workflow: nationalIdWorkflow,
    history: recentHistory,
    sandbox: projects[0].sandboxes[1],
  },
};
