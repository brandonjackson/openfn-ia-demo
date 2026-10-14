import type { Meta, StoryObj } from "@storybook/react";
import ProjectsTable from "./ProjectsTable";
import Button from "../Button";
import { projectsOverviewFor } from "../../mock-data/dashboard-stats";
import { currentUser } from "../../mock-data/users";
import { withRouter } from "../../stories/decorators";

const meta: Meta<typeof ProjectsTable> = {
  title: "Projects/ProjectsTable",
  component: ProjectsTable,
  decorators: [withRouter],
  args: {
    projects: projectsOverviewFor(currentUser.id),
    createButton: <Button className="w-full">Create project</Button>,
  },
};
export default meta;
type Story = StoryObj<typeof ProjectsTable>;

export const Default: Story = {};
export const Empty: Story = { args: { projects: [] } };
