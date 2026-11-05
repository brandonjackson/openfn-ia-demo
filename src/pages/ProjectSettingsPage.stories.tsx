import type { Meta, StoryObj } from "@storybook/react";
import ProjectSettingsPage, { type ProjectSettingsPageProps } from "./ProjectSettingsPage";
import { withRouterAt } from "../stories/decorators";
import type { IANode } from "../model/ia-tree";
import { projects } from "../fixtures/projects";
import { collectionItems, projectSettingsPageData, projectSettingsRecord } from "../fixtures/project-settings";

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

const [projectA, projectB] = projects;
const recordA = projectSettingsRecord(projectA);
/** Project A's settings as Jane Doe, its owner. */
const ownerData = projectSettingsPageData(projectA, recordA);

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
  onDownloadHistoryExport: () => {},
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

export const WebhookSecurity: Story = { args: { initialSection: "webhook-security" } };

export const Collaboration: Story = { args: { initialSection: "collaboration" } };

/** John Smith, an editor, can change only his own alerts and digest. */
export const CollaborationAsEditor: Story = {
  args: {
    initialSection: "collaboration",
    data: projectSettingsPageData(projectA, recordA, "jsmith@example.org"),
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
    data: projectSettingsPageData(projectB, projectSettingsRecord(projectB)),
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
  args: { data: projectSettingsPageData(projectA, recordA, "bwilson@example.org") },
};
