import type { Meta, StoryObj } from "@storybook/react";
import StepConfigPanel from "./StepConfigPanel";
import { nationalIdWorkflow } from "../../mock-data/workflow";
import type { JobNode } from "../../mock-data/workflow";

const search = nationalIdWorkflow.nodes.find((n) => n.id === "search") as JobNode;
const queue = nationalIdWorkflow.nodes.find((n) => n.id === "queue") as JobNode;

const meta: Meta<typeof StepConfigPanel> = {
  title: "Workflow/StepConfigPanel",
  component: StepConfigPanel,
  decorators: [
    (Story) => (
      <div className="h-[640px] w-80 border border-gray-200 bg-white">
        <Story />
      </div>
    ),
  ],
  args: { step: search, credentialId: "cred-identity-prod" },
};

export default meta;
type Story = StoryObj<typeof StepConfigPanel>;

export const Editable: Story = {
  args: { onChange: () => {}, onDelete: () => {} },
};

export const ReadOnly: Story = { args: { readOnly: true } };

/** A common step: no credential needed. */
export const CommonStep: Story = { args: { step: queue, credentialId: undefined, onChange: () => {} } };
