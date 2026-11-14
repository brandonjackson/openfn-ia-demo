import type { Meta, StoryObj } from "@storybook/react";
import StepCredentialPicker from "./StepCredentialPicker";
import { projectCredentials } from "../../fixtures/adaptor-reference";
import { credentialsForStep } from "../../model/step-credentials";

const inProduction = credentialsForStep(projectCredentials, "http", "production");
const inStaging = credentialsForStep(projectCredentials, "http", "staging");

const meta: Meta<typeof StepCredentialPicker> = {
  title: "Domain/StepCredentialPicker",
  component: StepCredentialPicker,
  decorators: [
    (Story) => (
      <div className="w-80">
        <Story />
      </div>
    ),
  ],
  args: { options: inProduction, environment: "production", target: "Identity", onChoose: () => {}, onNew: () => {} },
};

export default meta;
type Story = StoryObj<typeof StepCredentialPicker>;

/** No credential yet: each that fits is one click to add. */
export const NoneYet: Story = {};

/** One chosen: it can be removed, and the others swapped in. */
export const Chosen: Story = { args: { current: inProduction[0] } };

/** In a staging sandbox, only credentials with staging values are offered. */
export const InStaging: Story = { args: { options: inStaging, environment: "staging" } };

/** The chosen credential has no values where the step runs. */
export const ChosenHasNoValuesHere: Story = { args: { options: inStaging, environment: "staging", current: inProduction[0] } };

/** Nothing fits: just New credential. */
export const NothingFits: Story = { args: { options: [], target: "Malaria programme DHIS2" } };

/** On main, only what the step runs with shows. */
export const ReadOnly: Story = { args: { current: inProduction[0], readOnly: true } };

export const ReadOnlyNone: Story = { args: { readOnly: true } };
