import type { Meta, StoryObj } from "@storybook/react";
import WorkOrderRow from "./WorkOrderRow";
import { workOrders } from "../../mock-data/runs";

const retried = workOrders.find((o) => o.runs.length > 1)!;

const meta: Meta<typeof WorkOrderRow> = {
  title: "Workflow/WorkOrderRow",
  component: WorkOrderRow,
  args: { workOrder: workOrders[0] },
  decorators: [
    (Story) => (
      <div className="w-80 rounded-lg border border-gray-200 bg-white">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof WorkOrderRow>;

export const Default: Story = {};

export const Expanded: Story = { args: { expanded: true } };

/** Retried after a failure: the latest run's status shows, with a run count. */
export const Retried: Story = { args: { workOrder: retried } };

export const Failed: Story = { args: { workOrder: workOrders.find((o) => o.status === "failed")! } };
