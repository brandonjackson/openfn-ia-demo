import type { Meta, StoryObj } from "@storybook/react";
import NameBadge from "./NameBadge";

const meta: Meta<typeof NameBadge> = {
  title: "Project settings/NameBadge",
  component: NameBadge,
  args: { name: "openhie-project", children: "Your project will be named" },
  decorators: [(Story) => <small className="mt-2 block text-xs text-gray-600"><Story /></small>],
};
export default meta;
type Story = StoryObj<typeof NameBadge>;

export const Default: Story = {};
export const Collection: Story = { args: { name: "patient-registrations", children: "Your collection will be named" } };
