import type { Meta, StoryObj } from "@storybook/react";
import WorkflowEditorTemplate from "./WorkflowEditorTemplate";
import { nationalIdWorkflow, recentHistory } from "../mock-data/workflow";

const meta: Meta<typeof WorkflowEditorTemplate> = {
  title: "Templates/WorkflowEditorTemplate",
  component: WorkflowEditorTemplate,
  parameters: { layout: "fullscreen" },
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
