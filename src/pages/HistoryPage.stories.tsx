import type { Meta, StoryObj } from "@storybook/react";
import HistoryPage from "./HistoryPage";
import { withRouter } from "../stories/decorators";
import { historyData } from "../fixtures/history";
import type { IANode } from "../model/ia-tree";

const node: IANode = {
  id: "history",
  label: "History",
  description: "View historical work orders and channel requests across all projects.",
};

const ancestors = [{ node: { id: "root", label: "Home" }, path: "/" }];

const meta: Meta<typeof HistoryPage> = {
  title: "Pages/HistoryPage",
  component: HistoryPage,
  decorators: [withRouter],
  parameters: { layout: "padded" },
};

export default meta;
type Story = StoryObj<typeof HistoryPage>;

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
