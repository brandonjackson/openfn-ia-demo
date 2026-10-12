import type { Meta, StoryObj } from "@storybook/react";
import Sidebar from "./Sidebar";
import { withRouterAt } from "../stories/decorators";

const meta: Meta<typeof Sidebar> = {
  title: "Components/Sidebar",
  component: Sidebar,
  parameters: {
    layout: "fullscreen",
  },
  render: () => (
    <div className="flex h-screen">
      <Sidebar />
    </div>
  ),
};

export default meta;
type Story = StoryObj<typeof Sidebar>;

/** Org level: Overview, Context, Monitoring and recent Projects. */
export const Default: Story = {
  decorators: [withRouterAt("/overview")],
};

/** A page inside one of the labelled groups. */
export const MonitoringActive: Story = {
  decorators: [withRouterAt("/status")],
};

/** The full Projects list, reached from "View all". */
export const AllProjects: Story = {
  decorators: [withRouterAt("/projects")],
};

/** Inside a project: the project's own menu (Overview; Build; Maintain),
 *  with a way back to all projects.
 *  The project name lives in the top bar's project picker, not here.
 *  Support and the account menu stay pinned at the bottom. */
export const InsideProject: Story = {
  decorators: [withRouterAt("/projects/project-a/workflows")],
};

/** The project's Create page, the first item under Build. */
export const InsideProjectCreate: Story = {
  decorators: [withRouterAt("/projects/project-a/create")],
};

/** A page under Maintain. */
export const InsideProjectMaintain: Story = {
  decorators: [withRouterAt("/projects/project-a/deployments")],
};
