import type { Meta, StoryObj } from "@storybook/react";
import InsightsTemplate from "./InsightsTemplate";
import { withRouter } from "../stories/decorators";
import { mainNavTree } from "../ia-tree";
import { buildProjectInsightsData, insightsData } from "../mock-data/insights";

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

/** Inside a project: the same charts for just that project, without the by-project table. */
export const Project: Story = {
  args: {
    node: { id: "insights", label: "Insights", description: "Runs, errors and run times for this project." },
    ancestors: [
      { node: { id: "projects", label: "Projects" }, path: "/projects" },
      { node: { id: "project-a", label: "Project A" }, path: "/projects/project-a" },
    ],
    currentPath: "/projects/project-a/insights",
    data: buildProjectInsightsData("project-a"),
  },
};
