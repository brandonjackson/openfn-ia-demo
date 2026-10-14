import type { Meta, StoryObj } from "@storybook/react";
import NameBadge from "./NameBadge";

const meta: Meta<typeof NameBadge> = {
  title: "Shared/NameBadge",
  component: NameBadge,
  args: { name: "my-project", children: "Your project will be named" },
  decorators: [(Story) => <small className="block text-xs text-gray-600"><Story /></small>],
};
export default meta;
type Story = StoryObj<typeof NameBadge>;

export const Default: Story = {};
export const Empty: Story = { args: { name: "" } };
