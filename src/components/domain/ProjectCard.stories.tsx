import type { Meta, StoryObj } from "@storybook/react";
import ProjectCard from "./ProjectCard";
import { withRouter } from "../../stories/decorators";
import { projectSummaries } from "../../fixtures/projects";

const meta: Meta<typeof ProjectCard> = {
  title: "Domain/ProjectCard",
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

/** One of your projects: its ⋮ menu makes a copy and opens its settings. */
export const WithActions: Story = {
  args: { project: projectSummaries[0], onCopy: () => {}, showSettings: true },
};

export const LongName: Story = {
  args: { project: projectSummaries[2] },
};

export const EmptyProject: Story = {
  args: { project: projectSummaries[3] },
};

/** Without the service catalog: no service counts. */
export const WithoutServices: Story = {
  args: { project: { ...projectSummaries[0], serviceCount: undefined, liveServiceCount: undefined } },
};
