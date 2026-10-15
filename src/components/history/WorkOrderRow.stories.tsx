import type { Meta, StoryObj } from "@storybook/react";
import { withRouter } from "../../stories/decorators";
import { Table, Th, Tr } from "../Table";
import { findWorkOrder } from "../../mock-data/history";
import { historyWorkOrder } from "../../mock-data/history-extra";
import WorkOrderRow from "./WorkOrderRow";

const meta = {
  title: "History/WorkOrderRow",
  component: WorkOrderRow,
  decorators: [
    withRouter,
    (Story) => (
      <Table
        header={
          <Tr>
            <Th />
            <Th>ID</Th>
            <Th>Workflow</Th>
            <Th>Input</Th>
            <Th>Created</Th>
            <Th>Last Activity</Th>
            <Th align="right">Duration</Th>
            <Th align="right">Status</Th>
            <Th align="right">Runs</Th>
          </Tr>
        }
      >
        {Story()}
      </Table>
    ),
  ],
} satisfies Meta<typeof WorkOrderRow>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Collapsed: Story = { args: { workOrder: historyWorkOrder(findWorkOrder("wo-1")!), projectId: "p" } };
export const Expanded: Story = { args: { workOrder: historyWorkOrder(findWorkOrder("wo-1")!), projectId: "p", defaultExpanded: true } };
export const TwoRunsExpanded: Story = {
  args: { workOrder: historyWorkOrder(findWorkOrder("wo-2")!), projectId: "p", defaultExpanded: true },
};
export const Selected: Story = { args: { workOrder: historyWorkOrder(findWorkOrder("wo-4")!), projectId: "p", selected: true } };
export const Rejected: Story = { args: { workOrder: historyWorkOrder(findWorkOrder("wo-5")!), projectId: "p" } };
