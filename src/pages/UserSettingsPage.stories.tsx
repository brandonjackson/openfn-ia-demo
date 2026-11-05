import type { Meta, StoryObj } from "@storybook/react";
import UserSettingsPage from "./UserSettingsPage";
import { withRouter } from "../stories/decorators";
import type { IANode } from "../model/ia-tree";
import { userSettingsData } from "../fixtures/user";

const root: IANode = { id: "user-settings", label: "User settings", pageType: "user-settings" };
const ancestors = [{ node: root, path: "/user-settings" }];

const section = (id: string, label: string): IANode => ({ id, label, pageType: "user-settings" });

const meta: Meta<typeof UserSettingsPage> = {
  title: "Pages/UserSettingsPage",
  component: UserSettingsPage,
  args: { onGenerateToken: async () => "ofn_pat_demo_0000", onDeleteToken: async () => {} },
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

export const ProfileMfaAndGithub: Story = {
  name: "Profile (MFA + GitHub connected)",
  args: {
    ...Profile.args,
    data: {
      ...userSettingsData,
      profile: { ...userSettingsData.profile, mfaEnabled: true, githubConnected: true },
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
