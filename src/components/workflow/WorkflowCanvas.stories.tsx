import type { Meta, StoryObj } from "@storybook/react";
import WorkflowCanvas from "./WorkflowCanvas";
import { nationalIdWorkflow } from "../../mock-data/workflow";

const meta: Meta<typeof WorkflowCanvas> = {
  title: "Workflow/WorkflowCanvas",
  component: WorkflowCanvas,
  parameters: { layout: "fullscreen" },
};

export default meta;
type Story = StoryObj<typeof WorkflowCanvas>;

export const Default: Story = {
  args: { workflow: nationalIdWorkflow },
};

export const WithSelection: Story = {
  args: { workflow: nationalIdWorkflow, selectedId: "search" },
};

export const Bare: Story = {
  name: "No overlays",
  args: { workflow: nationalIdWorkflow, showMinimap: false, showControls: false },
};
