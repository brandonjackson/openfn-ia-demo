import { useState } from "react";
import type { ComponentProps } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import SegmentedControl from "./SegmentedControl";

const meta: Meta<typeof SegmentedControl> = {
  title: "Components/SegmentedControl",
  component: SegmentedControl,
  parameters: { layout: "padded" },
};

export default meta;
type Story = StoryObj<typeof SegmentedControl>;

function Stateful(args: Omit<ComponentProps<typeof SegmentedControl>, "value" | "onChange">) {
  const first = args.options[0];
  const [value, setValue] = useState(typeof first === "string" ? first : first.id);
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

/** The toolbar view switcher: only the selected option is tinted. */
export const Pill: Story = {
  render: () => <Stateful variant="pill" size="md" options={["Canvas", "Code", "Runs"]} />,
};

/** Pill tabs inside a tray header, with a disabled option. */
export const PillWithCounts: Story = {
  render: () => (
    <Stateful
      variant="pill"
      options={[
        { id: "log", label: "Log", count: 12 },
        { id: "input", label: "Input" },
        { id: "output", label: "Output", disabled: true },
      ]}
    />
  ),
};
