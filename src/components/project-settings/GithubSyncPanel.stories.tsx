import type { Meta, StoryObj } from "@storybook/react";
import GithubSyncPanel from "./GithubSyncPanel";
import { vcsFor } from "../../mock-data/project-settings";
import { projects } from "../../mock-data/projects";
import { withRouter } from "../../stories/decorators";

const meta: Meta<typeof GithubSyncPanel> = {
  title: "Project settings/GithubSyncPanel",
  component: GithubSyncPanel,
  decorators: [withRouter, (Story) => <div className="space-y-4 bg-secondary-100 p-6"><Story /></div>],
  args: {
    vcs: vcsFor(projects[0].id),
    canInstallGithub: true,
    canInitiateGithubSync: true,
    userGithubConnected: false,
  },
};
export default meta;
type Story = StoryObj<typeof GithubSyncPanel>;

export const NotConfigured: Story = {};
export const Connected: Story = { args: { vcs: vcsFor(projects[1].id) } };
export const ConnectAccount: Story = { args: { vcs: { githubEnabled: true, connection: null } } };
export const ViewerConnected: Story = {
  args: { vcs: vcsFor(projects[1].id), canInstallGithub: false, canInitiateGithubSync: false },
};
