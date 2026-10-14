import type { Meta, StoryObj } from "@storybook/react";
import HealthCard from "./HealthCard";

const meta: Meta<typeof HealthCard> = {
  title: "Projects/Health/HealthCard",
  component: HealthCard,
  decorators: [(Story) => <div className="w-96 bg-gray-100 p-6"><Story /></div>],
  args: {
    title: "Outcomes",
    meta: "303 work orders",
    children: <p className="flex min-h-55 items-center justify-center text-sm text-gray-500">Chart goes here</p>,
  },
};
export default meta;
type Story = StoryObj<typeof HealthCard>;

export const Default: Story = {};
