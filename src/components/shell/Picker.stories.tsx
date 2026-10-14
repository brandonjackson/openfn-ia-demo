import type { Meta, StoryObj } from "@storybook/react";
import Picker from "./Picker";
import { buildProjectPickerItems } from "./projectPickerItems";
import { projects } from "../../mock-data/projects";
import { withRouter } from "../../stories/decorators";

const meta: Meta<typeof Picker> = {
  title: "Shell/Picker",
  component: Picker,
  decorators: [withRouter],
  args: {
    items: buildProjectPickerItems("/projects/x/history"),
    currentId: projects[0].id,
    placeholder: "Search projects...",
    emptyMessage: "No projects found",
    viewAllLabel: "View all projects",
    viewAllHref: "/projects",
    openEvent: "open-project-picker",
    defaultOpen: true,
  },
};
export default meta;
type Story = StoryObj<typeof Picker>;

export const ProjectPicker: Story = {};
export const AdminTheme: Story = { args: { theme: "sudo-variant" } };
