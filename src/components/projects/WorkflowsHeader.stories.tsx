import type { Meta, StoryObj } from "@storybook/react";
import WorkflowsHeader from "./WorkflowsHeader";
import { projects } from "../../mock-data/projects";
import { withRouter } from "../../stories/decorators";

const meta: Meta<typeof WorkflowsHeader> = {
  title: "Projects/WorkflowsHeader",
  component: WorkflowsHeader,
  decorators: [withRouter],
  args: { count: 3, projectId: projects[0].id, searchTerm: "", onSearch: () => {} },
};
export default meta;
type Story = StoryObj<typeof WorkflowsHeader>;

export const Default: Story = {};
export const CannotCreate: Story = { args: { canCreate: false } };
