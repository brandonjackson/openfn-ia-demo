import type { Meta, StoryObj } from "@storybook/react";
import ProjectContextBar from "./ProjectContextBar";
import { withRouterAt } from "../../stories/decorators";
import { projects, recentProjects } from "../../fixtures/projects";

const projectA = projects[0];

const meta: Meta<typeof ProjectContextBar> = {
  title: "Domain/ProjectContextBar",
  component: ProjectContextBar,
  args: {
    recentProjects,
    sandbox: "main",
    onSelectSandbox: () => {},
    currentPath: "/projects/project-a",
    onNavigate: () => {},
  },
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

/** In a sandbox: the same chip as the editor's, amber, counting what the sandbox would bring back to main. */
export const InASandbox: Story = {
  args: {
    project: projectA,
    sandbox: projectA.sandboxes[1] ?? "main",
    sandboxTarget: "main",
    sandboxChanges: [
      { kind: "changed", summary: "Changed the workflow Apply for a national ID" },
      { kind: "added", summary: "Added the workflow Notify applicants" },
      { kind: "added", summary: "Added channel case-updates" },
    ],
    current: "Workflows",
  },
};
