import type { Meta, StoryObj } from "@storybook/react";
import InfoTooltip from "./InfoTooltip";

const meta: Meta<typeof InfoTooltip> = {
  title: "Shared/InfoTooltip",
  component: InfoTooltip,
  args: { title: "How often would you like to hear from us about your OpenFn account?" },
  decorators: [(Story) => <label className="text-sm/6 font-medium text-gray-800">Contact preference<Story /></label>],
};
export default meta;
type Story = StoryObj<typeof InfoTooltip>;

export const Default: Story = {};
