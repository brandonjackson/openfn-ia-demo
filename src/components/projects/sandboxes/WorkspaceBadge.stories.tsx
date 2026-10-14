import type { Meta, StoryObj } from "@storybook/react";
import WorkspaceBadge from "./WorkspaceBadge";

const meta: Meta<typeof WorkspaceBadge> = {
  title: "Projects/Sandboxes/WorkspaceBadge",
  component: WorkspaceBadge,
  args: { label: "main" },
};
export default meta;
type Story = StoryObj<typeof WorkspaceBadge>;

export const Main: Story = {};
export const Active: Story = { args: { label: "active" } };
export const Env: Story = { args: { label: "staging" } };
