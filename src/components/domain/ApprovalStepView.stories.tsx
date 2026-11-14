import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import ApprovalStepView from "./ApprovalStepView";
import { hardshipGrantWorkflow } from "../../fixtures/workflow";
import { newStepTool, type ApprovalTool } from "../../model/step-tools";

/** The hardship grant workflow's district officer approval. */
const node = hardshipGrantWorkflow.nodes.find((n) => n.id === "approve-grant");
const tool = (node?.type === "job" && node.tool?.kind === "approval" ? node.tool : newStepTool("approval")) as ApprovalTool;

/** The view with its changes kept, as the editor keeps them. */
function Editing({ initial }: { initial: ApprovalTool }) {
  const [value, setValue] = useState(initial);
  return <ApprovalStepView tool={value} onChange={setValue} />;
}

const meta: Meta<typeof ApprovalStepView> = {
  title: "Domain/ApprovalStepView",
  component: ApprovalStepView,
  args: { tool },
  decorators: [
    (Story) => (
      <div style={{ height: 760 }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof ApprovalStepView>;

/** In a sandbox: who's asked, what they see, and how long the run waits. */
export const Editable: Story = {
  render: (args) => <Editing initial={args.tool} />,
};

/** On main it only reads. */
export const ReadOnly: Story = {};

/** A step just added, with nobody to ask yet. */
export const New: Story = {
  render: () => <Editing initial={newStepTool("approval") as ApprovalTool} />,
};
