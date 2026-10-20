import type { Meta, StoryObj } from "@storybook/react";
import TableTemplate from "./TableTemplate";
import { withRouter } from "../stories/decorators";
import { historyData } from "../mock-data/history";
import type { IANode } from "../ia-tree";

const node: IANode = {
  id: "history",
  label: "History",
  description: "View historical work orders and channel requests across all projects.",
};

const ancestors = [{ node: { id: "root", label: "Home" }, path: "/" }];

const meta: Meta<typeof TableTemplate> = {
  title: "Templates/TableTemplate",
  component: TableTemplate,
  decorators: [withRouter],
  parameters: { layout: "padded" },
};

export default meta;
type Story = StoryObj<typeof TableTemplate>;

export const Default: Story = {
  args: {
    node,
    ancestors,
    currentPath: "/history",
    data: historyData,
  },
};

export const EmptyTable: Story = {
  args: {
    node,
    ancestors,
    currentPath: "/history",
    data: { ...historyData, rows: [] },
  },
};
