import type { Meta, StoryObj } from "@storybook/react";
import { findWorkflowGraph } from "../../mock-data/workflow";
import EdgeInspector from "./EdgeInspector";
import { withSidePanel } from "../../stories/decorators";

const openhie = findWorkflowGraph("wf-openhie")!;
const referrals = findWorkflowGraph("wf-referrals")!;

const meta: Meta<typeof EdgeInspector> = {
  title: "Workflow/EdgeInspector",
  component: EdgeInspector,
  decorators: [withSidePanel()],
  args: { edge: openhie.edges[1], onChange: () => {}, onDelete: () => {}, onClose: () => {} },
};
export default meta;
type Story = StoryObj<typeof EdgeInspector>;

export const OnSuccess: Story = {};
export const FromTrigger: Story = { args: { edge: openhie.edges[0] } };
export const JsExpression: Story = { args: { edge: referrals.edges[1] } };
