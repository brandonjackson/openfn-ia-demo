import type { Meta, StoryObj } from "@storybook/react";
import Donut from "./Donut";
import { workflowHealth, workOrders } from "../mock-data/runs";
import { nationalIdWorkflow } from "../mock-data/workflow";

const health = workflowHealth(nationalIdWorkflow, workOrders, "30d");

const meta: Meta<typeof Donut> = {
  title: "Components/Donut",
  component: Donut,
  decorators: [
    (Story) => (
      <div className="max-w-sm rounded-lg border border-gray-200 bg-white p-5">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Donut>;

/** Work orders by outcome, as on the editor's Health tab. */
export const Outcomes: Story = {
  args: {
    slices: [
      { key: "success", label: "Success", value: health.workOrders.succeeded, fillClassName: "fill-green-600", dotClassName: "bg-green-600" },
      { key: "failed", label: "Failed", value: health.workOrders.failed, fillClassName: "fill-red-500", dotClassName: "bg-red-500" },
    ],
    centre: {
      value: `${Math.round((health.workOrders.succeeded / health.workOrders.total) * 100)}%`,
      label: "success",
    },
  },
};

/** One slice fills the whole ring. */
export const AllSucceeded: Story = {
  args: {
    slices: [
      { key: "success", label: "Success", value: 12, fillClassName: "fill-green-600", dotClassName: "bg-green-600" },
      { key: "failed", label: "Failed", value: 0, fillClassName: "fill-red-500", dotClassName: "bg-red-500" },
    ],
    centre: { value: "100%", label: "success" },
  },
};

export const Empty: Story = {
  args: {
    slices: [],
    centre: { value: "–", label: "success" },
    emptyMessage: "No finished work orders in the last 24 hours",
  },
};
