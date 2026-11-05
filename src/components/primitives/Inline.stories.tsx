import type { Meta, StoryObj } from "@storybook/react";
import Inline from "./Inline";
import Button from "./Button";
import Badge from "./Badge";
import Text from "./Text";

const meta: Meta<typeof Inline> = {
  title: "Primitives/Inline",
  component: Inline,
  argTypes: {
    gap: { control: "select", options: ["none", "xs", "sm", "md", "lg", "xl"] },
    justify: { control: "select", options: ["start", "between", "end"] },
  },
};

export default meta;
type Story = StoryObj<typeof Inline>;

export const Default: Story = {
  args: {
    children: [<Text key="t" tone="strong">Sync patient records</Text>, <Badge key="b" label="Live" />],
  },
};

export const SpreadApart: Story = {
  args: {
    justify: "between",
    children: [
      <Text key="t" tone="muted">3 selected</Text>,
      <Inline key="a">
        <Button size="sm" variant="secondary">Clear</Button>
        <Button size="sm">Retry</Button>
      </Inline>,
    ],
  },
};
