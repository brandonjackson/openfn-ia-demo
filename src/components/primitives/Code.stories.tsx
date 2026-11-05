import type { Meta, StoryObj } from "@storybook/react";
import Code from "./Code";

const meta: Meta<typeof Code> = {
  title: "Primitives/Code",
  component: Code,
  args: { children: "wo-7f3a21" },
};

export default meta;
type Story = StoryObj<typeof Code>;

export const Default: Story = {};

export const InText: Story = {
  render: () => (
    <p className="text-sm text-gray-700">
      Map <Code>patient.id</Code> to <Code>person.nationalId</Code> before you send it.
    </p>
  ),
};
