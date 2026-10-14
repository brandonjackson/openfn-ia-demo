import type { Meta, StoryObj } from "@storybook/react";
import { findWorkflowGraph } from "../../mock-data/workflow";
import WorkflowCodePanel from "./WorkflowCodePanel";

const meta: Meta<typeof WorkflowCodePanel> = {
  title: "Workflow/WorkflowCodePanel",
  component: WorkflowCodePanel,
  decorators: [(Story) => <div className="bg-gray-100 h-[700px] flex justify-end"><Story /></div>],
  args: { graph: findWorkflowGraph("wf-openhie")!, onClose: () => {} },
};
export default meta;
type Story = StoryObj<typeof WorkflowCodePanel>;

export const OpenHIE: Story = {};
export const Referrals: Story = { args: { graph: findWorkflowGraph("wf-referrals")! } };
