import type { Meta, StoryObj } from "@storybook/react";
import { Lock } from "lucide-react";
import Badge from "./Badge";

const meta: Meta<typeof Badge> = {
  title: "Components/Badge",
  component: Badge,
  argTypes: {
    label: {
      control: "text",
      description: "Badge label text — also determines color via the built-in label map.",
    },
    tone: {
      control: "select",
      options: [undefined, "green", "yellow", "red", "blue", "purple", "gray"],
      description: "Explicit color; overrides the label map.",
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

export const ExplicitTone: Story = {
  args: { label: "Granted", tone: "green" },
};

export const WithIcon: Story = {
  args: { label: "Not allowed on Free plans", icon: Lock },
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex items-center gap-3">
      <Badge label="Live" />
      <Badge label="Draft" />
      <Badge label="Archived" />
      <Badge label="Granted" tone="green" />
      <Badge label="Expired" tone="red" />
      <Badge label="Event" tone="purple" />
      <Badge label="Success" />
      <Badge label="Failed" />
      <Badge label="Locked" icon={Lock} />
    </div>
  ),
};
