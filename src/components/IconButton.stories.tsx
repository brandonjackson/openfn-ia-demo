import type { Meta, StoryObj } from "@storybook/react";
import IconButton from "./IconButton";

const meta: Meta<typeof IconButton> = {
  title: "Shared/IconButton",
  component: IconButton,
  args: { icon: "hero-x-mark", label: "Close" },
};
export default meta;
type Story = StoryObj<typeof IconButton>;

export const Default: Story = {};
export const Small: Story = { args: { size: "sm", icon: "hero-trash", label: "Delete" } };
export const Large: Story = { args: { size: "lg", icon: "hero-cog-6-tooth", label: "Settings" } };
export const Active: Story = { args: { active: true, icon: "hero-view-columns", label: "Toggle panel orientation" } };
export const Disabled: Story = { args: { disabled: true, icon: "hero-play", label: "Run" } };
