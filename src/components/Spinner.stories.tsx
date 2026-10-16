import type { Meta, StoryObj } from "@storybook/react";
import Spinner from "./Spinner";

const meta: Meta<typeof Spinner> = {
  title: "Shared/Spinner",
  component: Spinner,
};
export default meta;
type Story = StoryObj<typeof Spinner>;

export const Default: Story = {};
export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-4 text-gray-500">
      <Spinner size="xs" />
      <Spinner size="sm" />
      <Spinner size="md" />
      <Spinner size="lg" />
    </div>
  ),
};
export const WithText: Story = {
  render: () => (
    <p className="flex items-center gap-2 text-sm text-gray-500">
      <Spinner /> Loading work orders…
    </p>
  ),
};
