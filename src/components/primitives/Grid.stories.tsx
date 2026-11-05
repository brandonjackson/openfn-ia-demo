import type { Meta, StoryObj } from "@storybook/react";
import Grid from "./Grid";
import FormField from "./FormField";
import { TextInput } from "./FormControls";
import Text from "./Text";

const meta: Meta<typeof Grid> = {
  title: "Primitives/Grid",
  component: Grid,
  parameters: { layout: "padded" },
};

export default meta;
type Story = StoryObj<typeof Grid>;

/** Two form fields side by side, stacking on a phone. */
export const TwoFields: Story = {
  args: {
    columns: 2,
    children: (
      <>
        <FormField label="First name" htmlFor="first">
          <TextInput id="first" defaultValue="Jane" />
        </FormField>
        <FormField label="Last name" htmlFor="last">
          <TextInput id="last" defaultValue="Doe" />
        </FormField>
      </>
    ),
  },
};

/** A sheet of short values, two across on a phone and five on a wide screen. */
export const FiveAcross: Story = {
  args: {
    columns: 5,
    gap: "sm",
    children: Array.from({ length: 10 }, (_, i) => (
      <Text key={i} mono>
        DEMO{String(i).padStart(5, "0")}
      </Text>
    )),
  },
};
