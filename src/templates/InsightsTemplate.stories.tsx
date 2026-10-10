import type { Meta, StoryObj } from "@storybook/react";
import InsightsTemplate from "./InsightsTemplate";
import { withRouter } from "../stories/decorators";
import { mainNavTree } from "../ia-tree";
import { insightsData } from "../mock-data/insights";

const node = mainNavTree.find((n) => n.id === "insights")!;
const ancestors: { node: typeof node; path: string }[] = [];

const meta: Meta<typeof InsightsTemplate> = {
  title: "Templates/InsightsTemplate",
  component: InsightsTemplate,
  decorators: [withRouter],
  parameters: { layout: "padded" },
  args: { node, ancestors, currentPath: "/insights", data: insightsData },
};

export default meta;
type Story = StoryObj<typeof InsightsTemplate>;

export const Default: Story = {};
