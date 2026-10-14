import type { Meta, StoryObj } from "@storybook/react";
import ProjectSetupPanel from "./ProjectSetupPanel";
import { projects } from "../../mock-data/projects";
import { withRouter } from "../../stories/decorators";

const meta: Meta<typeof ProjectSetupPanel> = {
  title: "Project settings/ProjectSetupPanel",
  component: ProjectSetupPanel,
  decorators: [withRouter, (Story) => <div className="space-y-4 bg-secondary-100 p-6"><Story /></div>],
  args: { project: projects[0], env: "main", canEditProject: true, canDeleteProject: true },
};
export default meta;
type Story = StoryObj<typeof ProjectSetupPanel>;

export const Owner: Story = {};
export const ReadOnly: Story = { args: { canEditProject: false, canDeleteProject: false } };
export const Sandbox: Story = { args: { project: projects[2], parentProject: projects[0] } };
