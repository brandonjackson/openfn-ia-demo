import type { Meta, StoryObj } from "@storybook/react";
import UserSettingsPage from "./UserSettingsPage";
import { withRouter } from "../stories/decorators";
import type { IANode } from "../model/ia-tree";
import { demoBackupCodes, demoMfaSetup, userSettingsData } from "../fixtures/user";

const root: IANode = { id: "user-settings", label: "User settings", pageType: "user-settings" };
const ancestors = [{ node: root, path: "/user-settings" }];

const section = (id: string, label: string): IANode => ({ id, label, pageType: "user-settings" });

const meta: Meta<typeof UserSettingsPage> = {
  title: "Pages/UserSettingsPage",
  component: UserSettingsPage,
  args: {
    onSaveProfile: async () => {},
    onChangeEmail: async () => {},
    onChangePassword: async () => {},
    onStartMfaSetup: async () => demoMfaSetup,
    onEnableMfa: async () => {},
    onDisableMfa: async () => {},
    onRegenerateBackupCodes: async () => {},
    onConnectGitHub: async () => {},
    onDisconnectGitHub: async () => {},
    onDeleteAccount: async () => {},
    onSaveCredential: async () => {},
    onDeleteCredential: async () => {},
    onTransferCredential: async () => {},
    onRevokeCredentialTransfer: async () => {},
    onSaveOAuthClient: async () => {},
    onDeleteOAuthClient: async () => {},
    onGenerateToken: async () => "ofn_pat_demo_0000",
    onDeleteToken: async () => {},
  },
  decorators: [withRouter],
  parameters: { layout: "padded" },
};

export default meta;
type Story = StoryObj<typeof UserSettingsPage>;

export const Profile: Story = {
  args: {
    node: section("profile", "Profile"),
    ancestors,
    currentPath: "/user-settings/profile",
    data: userSettingsData,
  },
};

/** MFA on, with its backup codes, and GitHub linked. */
export const ProfileMfaAndGithub: Story = {
  name: "Profile (MFA + GitHub connected)",
  args: {
    ...Profile.args,
    data: {
      ...userSettingsData,
      profile: { ...userSettingsData.profile, mfaEnabled: true, githubConnected: true },
      backupCodes: demoBackupCodes,
    },
  },
};

/** A new email waiting for its link to be clicked, and the account scheduled for deletion. */
export const ProfilePendingChanges: Story = {
  name: "Profile (email change pending, deletion scheduled)",
  args: {
    ...Profile.args,
    data: {
      ...userSettingsData,
      profile: { ...userSettingsData.profile, pendingEmail: "jane.doe@example.com", scheduledDeletion: "12 Nov 2026" },
    },
  },
};

export const Credentials: Story = {
  args: {
    node: section("credentials", "Credentials"),
    ancestors,
    currentPath: "/user-settings/credentials",
    data: userSettingsData,
  },
};

export const NoCredentials: Story = {
  args: {
    ...Credentials.args,
    data: { ...userSettingsData, credentials: [], oauthClients: [] },
  },
};

export const ApiTokens: Story = {
  name: "API tokens",
  args: {
    node: section("api-tokens", "API tokens"),
    ancestors,
    currentPath: "/user-settings/api-tokens",
    data: userSettingsData,
  },
};

export const NoApiTokens: Story = {
  name: "API tokens (empty)",
  args: {
    ...ApiTokens.args,
    data: { ...userSettingsData, apiTokens: [] },
  },
};

/** Without connected systems, organization credentials don't live in Systems, so there's no pointer to them. */
export const CredentialsWithoutSystems: Story = {
  args: { ...Credentials.args, data: { ...userSettingsData, orgCredentialsOnSystems: false } },
};
