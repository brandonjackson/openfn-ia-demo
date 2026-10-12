import type { Meta, StoryObj } from "@storybook/react";
import ProjectSwitcher from "./ProjectSwitcher";
import { withRouter } from "../stories/decorators";
import { projects } from "../mock-data/projects";

const meta: Meta<typeof ProjectSwitcher> = {
  title: "Components/ProjectSwitcher",
  component: ProjectSwitcher,
  decorators: [
    withRouter,
    (Story) => (
      <div className="h-80 p-4">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof ProjectSwitcher>;

export const Default: Story = {
  args: { projects, currentId: "project-a" },
};

export const Open: Story = {
  args: { projects, currentId: "project-a", defaultOpen: true },
};

export const LongName: Story = {
  args: { projects, currentId: "malawi-chw-referrals" },
};
