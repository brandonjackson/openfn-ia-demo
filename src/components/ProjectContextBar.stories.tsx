import type { Meta, StoryObj } from "@storybook/react";
import ProjectContextBar from "./ProjectContextBar";
import { withRouterAt } from "../stories/decorators";
import { projects } from "../mock-data/projects";

const projectA = projects[0];

const meta: Meta<typeof ProjectContextBar> = {
  title: "Components/ProjectContextBar",
  component: ProjectContextBar,
  decorators: [
    withRouterAt("/projects/project-a"),
    (Story) => (
      <div className="h-96">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof ProjectContextBar>;

/** On the project Overview: just the two pickers. */
export const Overview: Story = {
  args: { project: projectA },
};

export const OnASection: Story = {
  args: { project: projectA, current: "Settings" },
};

export const DeepPage: Story = {
  args: {
    project: projectA,
    trail: [{ label: "Services", path: "/projects/project-a/services" }],
    current: "Planning Application Intake",
  },
};

export const LongProjectName: Story = {
  args: { project: projects[2], current: "History" },
};
