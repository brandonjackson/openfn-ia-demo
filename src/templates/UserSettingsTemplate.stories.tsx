import type { Meta, StoryObj } from "@storybook/react";
import UserSettingsTemplate from "./UserSettingsTemplate";
import { withRouter } from "../stories/decorators";
import type { IANode } from "../ia-tree";
import { userSettingsData } from "../mock-data/user";

const root: IANode = { id: "user-settings", label: "User Settings", pageType: "user-settings" };
const ancestors = [{ node: root, path: "/user-settings" }];

const section = (id: string, label: string): IANode => ({ id, label, pageType: "user-settings" });

const meta: Meta<typeof UserSettingsTemplate> = {
  title: "Templates/UserSettingsTemplate",
  component: UserSettingsTemplate,
  decorators: [withRouter],
  parameters: { layout: "padded" },
};

export default meta;
type Story = StoryObj<typeof UserSettingsTemplate>;

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
  name: "API Tokens",
  args: {
    node: section("api-tokens", "API Tokens"),
    ancestors,
    currentPath: "/user-settings/api-tokens",
    data: userSettingsData,
  },
};

export const NoApiTokens: Story = {
  name: "API Tokens (empty)",
  args: {
    ...ApiTokens.args,
    data: { ...userSettingsData, apiTokens: [] },
  },
};
