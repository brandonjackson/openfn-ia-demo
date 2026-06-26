import type { Meta, StoryObj } from "@storybook/react";
import RecentHistoryPanel from "./RecentHistoryPanel";
import { recentHistory } from "../../mock-data/workflow";

const meta: Meta<typeof RecentHistoryPanel> = {
  title: "Workflow/RecentHistoryPanel",
  component: RecentHistoryPanel,
  parameters: { layout: "padded" },
};

export default meta;
type Story = StoryObj<typeof RecentHistoryPanel>;

export const Default: Story = { args: { entries: recentHistory } };
export const WithSelection: Story = {
  args: { entries: recentHistory, selectedId: "b10d4fb0" },
};
