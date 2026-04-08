import type { Meta, StoryObj } from "@storybook/react";
import ProjectTemplate from "./ProjectTemplate";
import { withRouter } from "../stories/decorators";
import type { IANode } from "../ia-tree";
import type { ProjectPageData } from "../page-data";

const node: IANode = {
  id: "project-a",
  label: "Project A",
  description:
    "Automates the intake and routing of planning applications from the e-planning portal.",
};

const ancestors = [
  { node: { id: "root", label: "Home" }, path: "/" },
  { node: { id: "projects", label: "Projects" }, path: "/projects" },
];

const projectData: ProjectPageData = {
  pageType: "project",
  projectId: "project-a",
  services: [
    {
      id: "planning-application-intake",
      name: "Planning Application Intake",
      description:
        "Receives planning applications from the e-planning portal and routes them to the local authority case management system.",
      status: "Live",
    },
    {
      id: "decision-status-sync",
      name: "Decision Status Sync",
      description: "Syncs planning decision statuses back to the applicant portal on a daily schedule.",
      status: "Draft",
    },
  ],
  components: [
    { id: "wf1", name: "planning-application-workflow", description: "Validates incoming data.", type: "Workflow" },
    { id: "a1", name: "application-field-mapping.json", description: "Maps portal fields.", type: "Artifact" },
    { id: "f1", name: "planning-submission-form", description: "Kobo form for supporting info.", type: "Form" },
    { id: "c1", name: "planning-authority-codes", description: "Lookup table of authority codes.", type: "Collection" },
  ],
};

const meta: Meta<typeof ProjectTemplate> = {
  title: "Templates/ProjectTemplate",
  component: ProjectTemplate,
  decorators: [withRouter],
  parameters: { layout: "padded" },
};

export default meta;
type Story = StoryObj<typeof ProjectTemplate>;

export const Default: Story = {
  args: {
    node,
    ancestors,
    currentPath: "/projects/project-a",
    data: projectData,
  },
};

export const EmptyProject: Story = {
  args: {
    node: { id: "new-project", label: "New Project", description: "A brand new project with nothing in it yet." },
    ancestors,
    currentPath: "/projects/new-project",
    data: {
      pageType: "project",
      projectId: "new-project",
      services: [],
      components: [],
    },
  },
};
