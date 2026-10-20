import type { Meta, StoryObj } from "@storybook/react";
import ProjectCard from "./ProjectCard";
import { withRouter } from "../stories/decorators";
import { projectSummaries } from "../mock-data/projects";

const meta: Meta<typeof ProjectCard> = {
  title: "Components/ProjectCard",
  component: ProjectCard,
  decorators: [
    withRouter,
    (Story) => (
      <div className="max-w-3xl">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof ProjectCard>;

export const Default: Story = {
  args: { project: projectSummaries[0] },
};

export const LongName: Story = {
  args: { project: projectSummaries[2] },
};

export const EmptyProject: Story = {
  args: { project: projectSummaries[3] },
};
