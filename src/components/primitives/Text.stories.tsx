import type { Meta, StoryObj } from "@storybook/react";
import Text from "./Text";
import Stack from "./Stack";

const meta: Meta<typeof Text> = {
  title: "Primitives/Text",
  component: Text,
  argTypes: {
    tone: { control: "select", options: ["default", "strong", "muted", "subtle", "danger", "success"] },
    size: { control: "select", options: ["xs", "sm", "md"] },
  },
};

export default meta;
type Story = StoryObj<typeof Text>;

export const Default: Story = { args: { children: "Runs every hour, on the hour." } };

export const Mono: Story = { args: { children: "a3f9c21e", mono: true, tone: "subtle", size: "xs" } };

export const AllTones: Story = {
  render: () => (
    <Stack gap="xs">
      <Text tone="strong">Strong: the name leading a row</Text>
      <Text>Default: body copy</Text>
      <Text tone="muted">Muted: when it last ran</Text>
      <Text tone="subtle">Subtle: an id beside a name</Text>
      <Text tone="danger">Danger: the step failed</Text>
      <Text tone="success">Success: all steps ran</Text>
    </Stack>
  ),
};
