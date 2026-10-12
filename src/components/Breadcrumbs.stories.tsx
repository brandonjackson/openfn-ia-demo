import type { Meta, StoryObj } from "@storybook/react";
import Breadcrumbs from "./Breadcrumbs";
import { withRouter, withRouterAt } from "../stories/decorators";

const meta: Meta<typeof Breadcrumbs> = {
  title: "Components/Breadcrumbs",
  component: Breadcrumbs,
};

export default meta;
type Story = StoryObj<typeof Breadcrumbs>;

export const SingleAncestor: Story = {
  decorators: [withRouter],
  args: {
    ancestors: [{ label: "Systems", path: "/connected-systems" }],
    current: "DHIS2",
  },
};

export const MultipleAncestors: Story = {
  decorators: [withRouter],
  args: {
    ancestors: [
      { label: "Projects", path: "/projects" },
      { label: "Project A", path: "/projects/project-a" },
      { label: "Services", path: "/projects/project-a/services" },
    ],
    current: "Planning Application Intake",
  },
};

export const NoAncestors: Story = {
  decorators: [withRouter],
  args: {
    ancestors: [],
    current: "Overview",
  },
};

/** Inside a project, the pickers replace the Home and Projects crumbs. */
export const InsideProject: Story = {
  decorators: [withRouterAt("/projects/project-a/history")],
  args: {
    ancestors: [
      { label: "Projects", path: "/projects" },
      { label: "Project A", path: "/projects/project-a" },
    ],
    current: "History",
  },
};
