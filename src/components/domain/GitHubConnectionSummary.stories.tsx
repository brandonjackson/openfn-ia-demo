import type { Meta, StoryObj } from "@storybook/react";
import GitHubConnectionSummary from "./GitHubConnectionSummary";
import { githubInstallations, projectGitHub } from "../../fixtures/project-settings";

const connection = projectGitHub("project-a").connection!;

const meta: Meta<typeof GitHubConnectionSummary> = {
  title: "Domain/GitHubConnectionSummary",
  component: GitHubConnectionSummary,
  parameters: { layout: "padded" },
  args: {
    projectId: "project-a",
    connection,
    installations: githubInstallations,
    onSync: () => {},
    onEdit: () => {},
    onDisconnect: () => {},
  },
};

export default meta;
type Story = StoryObj<typeof GitHubConnectionSummary>;

export const Default: Story = {};

/** A viewer can see the connection but can't sync or change it. */
export const ReadOnly: Story = { args: { onSync: undefined, onEdit: undefined, onDisconnect: undefined } };
