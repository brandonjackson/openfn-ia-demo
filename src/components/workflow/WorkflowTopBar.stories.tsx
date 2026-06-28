import type { Meta, StoryObj } from "@storybook/react";
import WorkflowTopBar from "./WorkflowTopBar";
import { nationalIdWorkflow } from "../../mock-data/workflow";

const meta: Meta<typeof WorkflowTopBar> = {
  title: "Workflow/WorkflowTopBar",
  component: WorkflowTopBar,
  parameters: { layout: "fullscreen" },
};

export default meta;
type Story = StoryObj<typeof WorkflowTopBar>;

export const Default: Story = { args: { workflow: nationalIdWorkflow } };
export const RetryRun: Story = {
  args: { workflow: nationalIdWorkflow, runLabel: "Run (Retry)" },
};
export const WithBackButton: Story = {
  args: { workflow: nationalIdWorkflow, onBack: () => {} },
};
