import type { Meta, StoryObj } from "@storybook/react";
import MaintenanceCard from "./MaintenanceCard";

const meta: Meta<typeof MaintenanceCard> = {
  title: "Admin/MaintenanceCard",
  component: MaintenanceCard,
  args: {
    title: "Refresh Adaptor Registry",
    description: "Re-fetch the list of available adaptors and their versions.",
  },
};
export default meta;
type Story = StoryObj<typeof MaintenanceCard>;

export const Default: Story = {};
export const Running: Story = { args: { running: true } };
