import type { Meta, StoryObj } from "@storybook/react";
import GitHubSyncForm from "./GitHubSyncForm";
import { githubInstallations, projectGitHub } from "../../fixtures/project-settings";

const meta: Meta<typeof GitHubSyncForm> = {
  title: "Domain/GitHubSyncForm",
  component: GitHubSyncForm,
  parameters: { layout: "padded" },
  args: { projectId: "project-b", installations: githubInstallations, onConnect: async () => {} },
};

export default meta;
type Story = StoryObj<typeof GitHubSyncForm>;

export const NewConnection: Story = {};

/** Changing an existing connection starts from its settings. */
export const ChangeConnection: Story = {
  args: { projectId: "project-a", initial: projectGitHub("project-a").connection, onCancel: () => {} },
};

export const Disabled: Story = { args: { disabled: true } };
