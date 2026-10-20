import type { Meta, StoryObj } from "@storybook/react";
import ProjectSettingsTemplate from "./ProjectSettingsTemplate";
import { withRouterAt } from "../stories/decorators";
import type { IANode } from "../ia-tree";
import type { ProjectSettingsPageData } from "../page-data";
import { orgCredentials } from "../mock-data/connected-systems";

const node: IANode = {
  id: "settings",
  label: "Settings",
  description: "View and manage project settings.",
  pageType: "project-settings",
};

const ancestors = [
  { node: { id: "root", label: "Home" }, path: "/" },
  { node: { id: "projects", label: "Projects" }, path: "/projects" },
  { node: { id: "project-a", label: "Project A" }, path: "/projects/project-a" },
];

const defaultData: ProjectSettingsPageData = {
  pageType: "project-settings",
  projectName: "brandon-demo",
  projectEnvironment: "main",
  projectDescription:
    "Automates the intake and routing of planning applications from the e-planning portal to local authority case management systems.",
  collaborators: [
    {
      name: "Brandon Jackson",
      email: "brandon@openfn.org",
      role: "Owner",
      isSelf: true,
      failureAlert: "Unavailable",
      digest: "Never",
    },
    {
      name: "Taylor Smith",
      email: "taylor@openfn.org",
      role: "Editor",
      isSelf: false,
      failureAlert: "Immediate",
      digest: "Daily",
    },
    {
      name: "Jordan Lee",
      email: "jordan@openfn.org",
      role: "Viewer",
      isSelf: false,
      failureAlert: "Unavailable",
      digest: "Weekly",
    },
  ],
  orgCredentials,
  retentionPeriod: "7 Days",
  ioDataPolicy: "retain",
  ioRetentionPeriod: "7 Days",
  mfaRequired: false,
  githubConnected: false,
  concurrencyDisabled: false,
};

const meta: Meta<typeof ProjectSettingsTemplate> = {
  title: "Templates/ProjectSettingsTemplate",
  component: ProjectSettingsTemplate,
  decorators: [withRouterAt("/projects/project-a/settings")],
  parameters: { layout: "padded" },
};

export default meta;
type Story = StoryObj<typeof ProjectSettingsTemplate>;

export const Setup: Story = {
  args: {
    node,
    ancestors,
    currentPath: "/projects/project-a/settings",
    data: defaultData,
  },
};

export const MFAEnabled: Story = {
  args: {
    node,
    ancestors,
    currentPath: "/projects/project-a/settings",
    data: {
      ...defaultData,
      mfaRequired: true,
    },
  },
};

export const GitHubConnected: Story = {
  args: {
    node,
    ancestors,
    currentPath: "/projects/project-a/settings",
    data: {
      ...defaultData,
      githubConnected: true,
    },
  },
};

export const ZeroPersistence: Story = {
  args: {
    node,
    ancestors,
    currentPath: "/projects/project-a/settings",
    data: {
      ...defaultData,
      ioDataPolicy: "zero-persistence",
    },
  },
};

export const SoloCollaborator: Story = {
  args: {
    node,
    ancestors,
    currentPath: "/projects/project-a/settings",
    data: {
      ...defaultData,
      collaborators: [defaultData.collaborators[0]],
    },
  },
};
