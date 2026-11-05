import type { Meta, StoryObj } from "@storybook/react";
import MaintenanceTaskCard from "./MaintenanceTaskCard";
import { maintenanceTasks } from "../../fixtures/admin";

const meta: Meta<typeof MaintenanceTaskCard> = {
  title: "Domain/MaintenanceTaskCard",
  component: MaintenanceTaskCard,
  parameters: { layout: "padded" },
  args: {
    task: maintenanceTasks[0],
    // Takes a moment, so Run shows Running… and then Done.
    onRun: () => new Promise((resolve) => setTimeout(resolve, 1500)),
  },
};

export default meta;
type Story = StoryObj<typeof MaintenanceTaskCard>;

export const RefreshAdaptorRegistry: Story = {};

export const RefreshAdaptorIcons: Story = { args: { task: maintenanceTasks[1] } };

export const NeverRun: Story = { args: { task: { ...maintenanceTasks[0], lastRun: undefined } } };
