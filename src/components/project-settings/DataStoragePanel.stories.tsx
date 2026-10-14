import type { Meta, StoryObj } from "@storybook/react";
import DataStoragePanel from "./DataStoragePanel";
import { dataRetentionPeriods } from "../../mock-data/project-settings";

const meta: Meta<typeof DataStoragePanel> = {
  title: "Project settings/DataStoragePanel",
  component: DataStoragePanel,
  decorators: [(Story) => <div className="space-y-4 bg-gray-100 p-6"><Story /></div>],
  args: {
    initial: { historyRetentionPeriod: null, dataclipRetentionPeriod: null, retentionPolicy: "retain_all" },
    periods: dataRetentionPeriods,
    canEditDataRetention: true,
  },
};
export default meta;
type Story = StoryObj<typeof DataStoragePanel>;

export const Unset: Story = {};
export const Configured: Story = {
  args: { initial: { historyRetentionPeriod: 90, dataclipRetentionPeriod: 30, retentionPolicy: "retain_all" } },
};
export const ZeroPersistence: Story = {
  args: { initial: { historyRetentionPeriod: 30, dataclipRetentionPeriod: null, retentionPolicy: "erase_all" } },
};
export const ReadOnly: Story = { args: { canEditDataRetention: false } };
