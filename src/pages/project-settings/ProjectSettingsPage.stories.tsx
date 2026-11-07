import type { Meta, StoryObj } from "@storybook/react";
import ProjectSettingsPage, { type ProjectSettingsPageData, type ProjectSettingsPageProps } from "./ProjectSettingsPage";
import { withRouterAt } from "../../stories/decorators";
import type { IANode } from "../../model/ia-tree";
import type { Project } from "../../model/projects";
import { permissionsFor } from "../../model/project-settings";
import { projects } from "../../fixtures/projects";
import { orgCredentials } from "../../fixtures/connected-systems";
import {
  collectionItems,
  projectCollaborators,
  projectRoleOf,
  projectSettingsRecord,
  webhookTriggers,
  type ProjectSettingsRecord,
} from "../../fixtures/project-settings";

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

/** The settings page's data for whoever is signed in (`you`, by email), from the fixtures' pieces. */
function settingsData(project: Project, record: ProjectSettingsRecord, you?: string): ProjectSettingsPageData {
  return {
    projectId: project.id,
    projectName: record.name,
    projectEnvironment: record.environment,
    projectDescription: record.description,
    permissions: permissionsFor(projectRoleOf(record, you)),
    concurrencyDisabled: record.concurrencyDisabled,
    // The organisation's credentials that projects may use, as if linked to this one.
    credentials: orgCredentials
      .filter((c) => c.hasAccess)
      .map((c) => ({ id: c.id, name: c.name, type: c.system, environments: [c.environment], owner: c.owner })),
    collections: record.collections,
    webhookAuthMethods: record.webhookAuthMethods,
    webhookTriggers: webhookTriggers(project),
    collaborators: projectCollaborators(record, you),
    mfaRequired: record.mfaRequired,
    github: record.github,
    dataStorage: record.dataStorage,
    historyExports: record.historyExports,
  };
}

const [projectA, projectB] = projects;
const recordA = projectSettingsRecord(projectA);
/** Project A's settings as Jane Doe, its owner. */
const ownerData = settingsData(projectA, recordA);

const done = async () => {};

const actions: Omit<ProjectSettingsPageProps, "node" | "ancestors" | "currentPath" | "data"> = {
  onSaveProjectIdentity: done,
  onSaveConcurrency: done,
  onExportProject: async () => "name: project-a\nworkflows: {}\n",
  onDeleteProject: done,
  onCreateCollection: done,
  onRenameCollection: done,
  onDeleteCollection: done,
  onPreviewCollection: async (id) => collectionItems[id] ?? [],
  onCreateWebhookAuthMethod: async ({ type }) => ({ secret: type === "api" ? "5f0c2e9a7b14d36e8c01a2f4b9d7e6c3" : undefined }),
  onUpdateWebhookAuthMethod: done,
  onDeleteWebhookAuthMethod: done,
  onAddCollaborators: async (drafts) => ({ notFound: drafts.filter((d) => !d.email.endsWith("@example.org")) }),
  onInviteCollaborators: done,
  onChangeCollaboratorRole: done,
  onSetFailureAlert: done,
  onSetDigest: done,
  onRemoveCollaborator: done,
  onSetMfaRequired: done,
  onConnectGitHubAccount: done,
  onConnectGitHub: done,
  onInitiateGitHubSync: done,
  onDisconnectGitHub: done,
  onSaveDataStorage: done,
  onCreateHistoryExport: done,
  onDownloadHistoryExport: async () => {},
};

const meta: Meta<typeof ProjectSettingsPage> = {
  title: "Pages/ProjectSettingsPage",
  component: ProjectSettingsPage,
  decorators: [withRouterAt("/projects/project-a/settings")],
  parameters: { layout: "padded" },
  args: { node, ancestors, currentPath: "/projects/project-a/settings", data: ownerData, ...actions },
};

export default meta;
type Story = StoryObj<typeof ProjectSettingsPage>;

export const Setup: Story = {};

export const Collections: Story = { args: { initialSection: "collections" } };

export const NoCollections: Story = {
  args: { initialSection: "collections", data: { ...ownerData, collections: [] } },
};

export const Credentials: Story = { args: { initialSection: "credentials" } };

/** Lightning names environments freely: a credential with values for several, one of them a name the badges don't know. */
export const CredentialsInManyEnvironments: Story = {
  args: {
    initialSection: "credentials",
    data: {
      ...ownerData,
      credentials: [{ ...ownerData.credentials[0]!, environments: ["production", "staging", "main"] }, ...ownerData.credentials.slice(1)],
    },
  },
};

export const NoCredentials: Story = { args: { initialSection: "credentials", data: { ...ownerData, credentials: [] } } };

export const WebhookSecurity: Story = { args: { initialSection: "webhook-security" } };

export const Collaboration: Story = { args: { initialSection: "collaboration" } };

/** John Smith, an editor, can change only his own alerts and digest. */
export const CollaborationAsEditor: Story = {
  args: {
    initialSection: "collaboration",
    data: settingsData(projectA, recordA, "jsmith@example.org"),
  },
};

export const MFAEnabled: Story = {
  args: { initialSection: "security", data: { ...ownerData, mfaRequired: true } },
};

export const GitHubConnected: Story = { args: { initialSection: "sync-to-github" } };

/** Your GitHub account is linked, so you can pick an installation, repository and branch. */
export const GitHubSetup: Story = {
  args: {
    initialSection: "sync-to-github",
    data: settingsData(projectB, projectSettingsRecord(projectB)),
  },
};

export const GitHubAccountNotLinked: Story = {
  args: {
    initialSection: "sync-to-github",
    data: { ...ownerData, github: { accountConnected: false, installations: [] } },
  },
};

export const ZeroPersistence: Story = {
  args: {
    initialSection: "data-storage",
    data: { ...ownerData, dataStorage: { ...ownerData.dataStorage, ioDataPolicy: "zero-persistence" } },
  },
};

export const HistoryExports: Story = { args: { initialSection: "history-exports" } };

/** Beth Wilson, a viewer, sees every section but can't change the project. */
export const AsViewer: Story = {
  args: { data: settingsData(projectA, recordA, "bwilson@example.org") },
};
