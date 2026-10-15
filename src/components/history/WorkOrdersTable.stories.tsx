import type { Meta, StoryObj } from "@storybook/react";
import { useState, type ComponentProps } from "react";
import { withRouter } from "../../stories/decorators";
import { workOrders } from "../../mock-data/history";
import { historyWorkOrder } from "../../mock-data/history-extra";
import WorkOrdersTable from "./WorkOrdersTable";

const meta = {
  title: "History/WorkOrdersTable",
  component: WorkOrdersTable,
  decorators: [withRouter],
} satisfies Meta<typeof WorkOrdersTable>;
export default meta;
type Story = StoryObj<typeof meta>;

const base = {
  workOrders: workOrders.map(historyWorkOrder),
  projectId: "p",
  sort: { by: "last_activity", direction: "desc" } as const,
  onSort: () => {},
  selectedIds: [] as string[],
  onSelectionChange: () => {},
};

function Demo(args: ComponentProps<typeof WorkOrdersTable>) {
  const [ids, setIds] = useState<string[]>(args.selectedIds);
  return <WorkOrdersTable {...args} selectedIds={ids} onSelectionChange={setIds} />;
}

export const Default: Story = { args: base, render: (args) => <Demo {...args} /> };
export const WithSelection: Story = { args: { ...base, selectedIds: ["wo-1", "wo-2"] } };
export const Empty: Story = { args: { ...base, workOrders: [] } };
