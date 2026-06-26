import type { Meta, StoryObj } from "@storybook/react";
import Breadcrumbs from "./Breadcrumbs";
import { withRouter } from "../stories/decorators";

const meta: Meta<typeof Breadcrumbs> = {
  title: "Components/Breadcrumbs",
  component: Breadcrumbs,
  decorators: [withRouter],
};

export default meta;
type Story = StoryObj<typeof Breadcrumbs>;

export const SingleAncestor: Story = {
  args: {
    ancestors: [{ label: "Systems", path: "/connected-systems" }],
    current: "DHIS2",
  },
};

export const MultipleAncestors: Story = {
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
  args: {
    ancestors: [],
    current: "Overview",
  },
};
