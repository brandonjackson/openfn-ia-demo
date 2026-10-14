import type { Meta, StoryObj } from "@storybook/react";
import BranchesIcon from "./BranchesIcon";

const meta: Meta<typeof BranchesIcon> = {
  title: "Projects/Sandboxes/BranchesIcon",
  component: BranchesIcon,
  args: { className: "h-6 w-6 text-slate-700" },
};
export default meta;
type Story = StoryObj<typeof BranchesIcon>;

export const Default: Story = {};
