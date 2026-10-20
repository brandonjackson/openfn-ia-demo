import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import SegmentedControl from "./SegmentedControl";

const meta: Meta<typeof SegmentedControl> = {
  title: "Components/SegmentedControl",
  component: SegmentedControl,
  parameters: { layout: "padded" },
};

export default meta;
type Story = StoryObj<typeof SegmentedControl>;

function Stateful(args: { label?: string; options: string[] }) {
  const [value, setValue] = useState(args.options[0]);
  return <SegmentedControl {...args} value={value} onChange={setValue} />;
}

export const Default: Story = {
  render: () => <Stateful label="Status" options={["All", "Success", "Failed", "Pending"]} />,
};

export const Access: Story = {
  render: () => <Stateful label="Access" options={["All", "You have access", "No access"]} />,
};

export const WithoutLabel: Story = {
  render: () => <Stateful options={["Day", "Week", "Month"]} />,
};
