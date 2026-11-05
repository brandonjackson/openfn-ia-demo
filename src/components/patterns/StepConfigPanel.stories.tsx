import type { Meta, StoryObj } from "@storybook/react";
import StepConfigPanel from "./StepConfigPanel";
import { nationalIdWorkflow, registerCaseWorkflow, weeklyCaseReportWorkflow } from "../../fixtures/workflow";
import type { JobNode } from "../../model/workflow";

const search = nationalIdWorkflow.nodes.find((n) => n.id === "search") as JobNode;
const queue = nationalIdWorkflow.nodes.find((n) => n.id === "queue") as JobNode;

const meta: Meta<typeof StepConfigPanel> = {
  title: "Patterns/StepConfigPanel",
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

/** A step on a system reached over X-Road: no credential to pick. */
export const OnXRoadSystem: Story = {
  args: { step: registerCaseWorkflow.nodes.find((n) => n.id === "openmrs-patient") as JobNode, onChange: () => {} },
};

/** A step on a system reached directly, with its credential. */
export const OnDirectSystem: Story = {
  args: { step: weeklyCaseReportWorkflow.nodes.find((n) => n.id === "send-dhis2") as JobNode, onChange: () => {} },
};
