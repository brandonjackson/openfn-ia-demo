import type { Meta, StoryObj } from "@storybook/react";
import { findWorkflowGraph } from "../../mock-data/workflow";
import { newWorkflowGraph } from "../../utils/workflowGraph";
import WorkflowDiagram from "./WorkflowDiagram";

const meta: Meta<typeof WorkflowDiagram> = {
  title: "Workflow/WorkflowDiagram",
  component: WorkflowDiagram,
  parameters: { layout: "fullscreen" },
  decorators: [(Story) => <div className="h-[720px]"><Story /></div>],
  args: { graph: findWorkflowGraph("wf-openhie")!, selection: null, onSelect: () => {}, onAddPath: () => {} },
};
export default meta;
type Story = StoryObj<typeof WorkflowDiagram>;

export const OpenHIE: Story = {};
export const JobSelected: Story = { args: { selection: { kind: "job", id: "job-transform" } } };
export const EdgeSelected: Story = { args: { selection: { kind: "edge", id: "edge-openhie-failed" } } };
export const CronWithJsExpression: Story = { args: { graph: findWorkflowGraph("wf-referrals")! } };
export const DisabledCronTrigger: Story = { args: { graph: findWorkflowGraph("wf-facility-sync")! } };
export const ViewingARun: Story = {
  args: {
    run: {
      steps: {
        "job-transform": { state: "success", duration: "1.00s" },
        "job-send": { state: "success", duration: "2.00s" },
        "job-notify-ok": { state: "success", duration: "1.00s" },
      },
      startNodeId: "trigger-openhie",
      startedBy: "Trigger",
    },
  },
};
export const Empty: Story = { args: { graph: newWorkflowGraph("p") } };
