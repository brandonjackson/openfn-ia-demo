import type { Meta, StoryObj } from "@storybook/react";
import WorkflowsTable from "./WorkflowsTable";
import { workflowStatsFor } from "../../mock-data/dashboard-stats";
import { projects } from "../../mock-data/projects";
import { withRouter } from "../../stories/decorators";

const meta: Meta<typeof WorkflowsTable> = {
  title: "Projects/WorkflowsTable",
  component: WorkflowsTable,
  decorators: [withRouter],
  args: { projectId: projects[0].id, stats: workflowStatsFor(projects[0].id) },
};
export default meta;
type Story = StoryObj<typeof WorkflowsTable>;

export const Default: Story = {};
export const ViewerCannotDelete: Story = { args: { canDelete: false } };
export const Empty: Story = { args: { stats: [] } };
export const NoSearchMatches: Story = { args: { stats: [], searchTerm: "dhis" } };
