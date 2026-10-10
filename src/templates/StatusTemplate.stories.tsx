import type { Meta, StoryObj } from "@storybook/react";
import StatusTemplate from "./StatusTemplate";
import { withRouter } from "../stories/decorators";
import { mainNavTree } from "../ia-tree";
import { statusData } from "../mock-data/status";

const node = mainNavTree.find((n) => n.id === "status")!;
const ancestors: { node: typeof node; path: string }[] = [];

const meta: Meta<typeof StatusTemplate> = {
  title: "Templates/StatusTemplate",
  component: StatusTemplate,
  decorators: [withRouter],
  parameters: { layout: "padded" },
  args: { node, ancestors, currentPath: "/status", data: statusData },
};

export default meta;
type Story = StoryObj<typeof StatusTemplate>;

export const Default: Story = {};

/** Nothing wrong anywhere. */
export const AllOperational: Story = {
  args: {
    data: {
      ...statusData,
      systems: statusData.systems.map((s) => ({ ...s, status: "operational", note: "Responding normally." })),
      workflows: statusData.workflows.map((w) => ({ ...w, status: "operational", note: "Last run succeeded." })),
    },
  },
};
