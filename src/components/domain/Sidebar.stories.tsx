import type { Meta, StoryObj } from "@storybook/react";
import Sidebar from "./Sidebar";
import { withRouterAt } from "../../stories/decorators";
import { allFlagsOff } from "../../model/feature-flags";

const meta: Meta<typeof Sidebar> = {
  title: "Domain/Sidebar",
  component: Sidebar,
  parameters: {
    layout: "fullscreen",
  },
  render: (args) => (
    <div className="flex h-screen">
      <Sidebar {...args} />
    </div>
  ),
};

export default meta;
type Story = StoryObj<typeof Sidebar>;

/** Instance level: Overview, Organization, Monitoring and recent Projects. */
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

/** With every feature flag off: no organization layer, so just projects,
 *  Support and the account menu, as in Lightning. */
export const WithoutOrganizations: Story = {
  decorators: [withRouterAt("/projects", allFlagsOff)],
};

/** Inside a project with every feature flag off: no Create or Deployments,
 *  and Channels in place of Components. */
export const InsideProjectRedesign: Story = {
  decorators: [withRouterAt("/projects/project-a/workflows", allFlagsOff)],
};

/** On a small screen the sidebar is a drawer. Open, it slides in over a
 *  dimmed page with a close button by the logo (narrow the canvas to see it). */
export const MobileOpen: Story = {
  decorators: [withRouterAt("/overview")],
  args: { open: true, onClose: () => {} },
};
