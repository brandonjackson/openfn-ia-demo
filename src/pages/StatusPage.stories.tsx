import type { Meta, StoryObj } from "@storybook/react";
import StatusPage from "./StatusPage";
import { withRouter } from "../stories/decorators";
import { mainNavTree } from "../model/ia-tree";
import { statusData } from "../fixtures/status";

const node = mainNavTree.find((n) => n.id === "status")!;
const ancestors: { node: typeof node; path: string }[] = [];

const meta: Meta<typeof StatusPage> = {
  title: "Pages/StatusPage",
  component: StatusPage,
  decorators: [withRouter],
  parameters: { layout: "padded" },
  args: { node, ancestors, currentPath: "/status", data: statusData },
};

export default meta;
type Story = StoryObj<typeof StatusPage>;

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
