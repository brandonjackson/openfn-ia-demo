import type { Meta, StoryObj } from "@storybook/react";
import StepConfigPanel from "./StepConfigPanel";
import { nationalIdWorkflow, registerCaseWorkflow, weeklyCaseReportWorkflow } from "../../fixtures/workflow";
import type { JobNode } from "../../model/workflow";
import { adaptorChoices, adaptorInfo, credentialsFor } from "../../fixtures/adaptor-reference";
import { connectedSystems } from "../../fixtures/connected-systems";

const search = nationalIdWorkflow.nodes.find((n) => n.id === "search") as JobNode;
const queue = nationalIdWorkflow.nodes.find((n) => n.id === "queue") as JobNode;

/** A step with what the panel looks up about it: its adaptor, the choices, its credentials and the project's systems. */
const configFor = (step: JobNode) => ({
  step,
  adaptor: adaptorInfo[step.adaptor],
  adaptorChoices: adaptorChoices.map((a) => adaptorInfo[a]),
  credentials: credentialsFor(step.adaptor),
  systems: connectedSystems,
});

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
  args: { ...configFor(search), credentialId: "cred-identity-prod" },
};

export default meta;
type Story = StoryObj<typeof StepConfigPanel>;

export const Editable: Story = {
  args: { onChange: () => {}, onDelete: () => {} },
};

export const ReadOnly: Story = { args: { readOnly: true } };

/** A common step: no credential needed. */
export const CommonStep: Story = { args: { ...configFor(queue), credentialId: undefined, onChange: () => {} } };

/** A step on a system reached over X-Road: no credential to pick. */
export const OnXRoadSystem: Story = {
  args: { ...configFor(registerCaseWorkflow.nodes.find((n) => n.id === "openmrs-patient") as JobNode), onChange: () => {} },
};

/** A step on a system reached directly, with its credential. */
export const OnDirectSystem: Story = {
  args: { ...configFor(weeklyCaseReportWorkflow.nodes.find((n) => n.id === "send-dhis2") as JobNode), onChange: () => {} },
};

/** Without connected systems: a step is an adaptor and a credential, with no System field. */
export const WithoutSystems: Story = { args: { systems: [], onChange: () => {} } };
