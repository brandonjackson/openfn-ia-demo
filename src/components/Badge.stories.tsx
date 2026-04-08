import type { Meta, StoryObj } from "@storybook/react";
import Badge from "./Badge";

const meta: Meta<typeof Badge> = {
  title: "Components/Badge",
  component: Badge,
  argTypes: {
    label: {
      control: "text",
      description: "Badge label text — also determines color via the built-in color map.",
    },
  },
};

export default meta;
type Story = StoryObj<typeof Badge>;

export const Live: Story = {
  args: { label: "Live" },
};

export const Draft: Story = {
  args: { label: "Draft" },
};

export const CustomLabel: Story = {
  args: { label: "Beta" },
  name: "Unknown label (gray fallback)",
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex items-center gap-3">
      <Badge label="Live" />
      <Badge label="Draft" />
      <Badge label="Archived" />
    </div>
  ),
};
