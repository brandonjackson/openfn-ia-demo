import type { Meta, StoryObj } from "@storybook/react";
import EnvVarRow from "./EnvVarRow";
import Card from "../primitives/Card";
import { projectAEnvVars } from "../../fixtures/env-vars";

const [dhis2Prod, , identityProd, , smsSender] = projectAEnvVars;

const meta: Meta<typeof EnvVarRow> = {
  title: "Domain/EnvVarRow",
  component: EnvVarRow,
  parameters: { layout: "padded" },
  decorators: [
    (Story) => (
      <Card flush>
        <Story />
      </Card>
    ),
  ],
  args: {
    variable: dhis2Prod,
    existing: projectAEnvVars,
    onUpdate: () => new Promise((resolve) => setTimeout(resolve, 400)),
    onDelete: () => {},
  },
};

export default meta;
type Story = StoryObj<typeof EnvVarRow>;

/** Its value hidden until shown. */
export const Default: Story = {};

export const Revealed: Story = { args: { defaultRevealed: true } };

/** A secret: never shown, and its value can only be replaced. */
export const Secret: Story = { args: { variable: identityProd } };

/** Open to edit in place. */
export const Editing: Story = { args: { variable: smsSender!, defaultExpanded: true } };

export const EditingSecret: Story = { args: { variable: identityProd, defaultExpanded: true } };

/** For a viewer: no actions, and it opens to who changed it last. */
export const ReadOnly: Story = { args: { onUpdate: undefined, onDelete: undefined, defaultExpanded: true } };
