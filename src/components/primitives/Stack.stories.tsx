import type { Meta, StoryObj } from "@storybook/react";
import Stack from "./Stack";
import Card from "./Card";
import Text from "./Text";

const meta: Meta<typeof Stack> = {
  title: "Primitives/Stack",
  component: Stack,
  argTypes: { gap: { control: "select", options: ["none", "xs", "sm", "md", "lg", "xl"] } },
};

export default meta;
type Story = StoryObj<typeof Stack>;

export const Default: Story = {
  args: {
    gap: "md",
    children: [
      <Card key="1" title="Project identity" />,
      <Card key="2" title="Concurrency" />,
      <Card key="3" title="Export" />,
    ],
  },
};

export const Divided: Story = {
  render: () => (
    <Card flush>
      <Stack divided>
        <Text>First row</Text>
        <Text>Second row</Text>
        <Text>Third row</Text>
      </Stack>
    </Card>
  ),
};
