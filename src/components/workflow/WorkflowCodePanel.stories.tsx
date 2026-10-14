import type { Meta, StoryObj } from "@storybook/react";
import { findWorkflowGraph } from "../../mock-data/workflow";
import WorkflowCodePanel from "./WorkflowCodePanel";
import { withSidePanel } from "../../stories/decorators";

const meta: Meta<typeof WorkflowCodePanel> = {
  title: "Workflow/WorkflowCodePanel",
  component: WorkflowCodePanel,
  decorators: [withSidePanel("h-175")],
  args: { graph: findWorkflowGraph("wf-openhie")!, onClose: () => {} },
};
export default meta;
type Story = StoryObj<typeof WorkflowCodePanel>;

export const OpenHIE: Story = {};
export const Referrals: Story = { args: { graph: findWorkflowGraph("wf-referrals")! } };
