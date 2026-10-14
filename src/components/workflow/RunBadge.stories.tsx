import type { Meta, StoryObj } from "@storybook/react";
import RunBadge from "./RunBadge";

const meta: Meta<typeof RunBadge> = {
  title: "Workflow/RunBadge",
  component: RunBadge,
  args: { runId: "run-1-7f3a91c2", onClose: () => {} },
};
export default meta;
type Story = StoryObj<typeof RunBadge>;

export const Default: Story = {};
export const Warning: Story = { args: { variant: "warning" } };
export const NoClose: Story = { args: { onClose: undefined } };
