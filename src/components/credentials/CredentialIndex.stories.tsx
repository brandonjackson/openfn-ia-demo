import type { Meta, StoryObj } from "@storybook/react";
import CredentialIndex from "./CredentialIndex";
import NewCredentialMenuButton from "./NewCredentialMenuButton";
import { projectCredentialMenuOptions } from "./credentialModalEvents";
import { projects } from "../../mock-data/projects";

const meta: Meta<typeof CredentialIndex> = {
  title: "Credentials/CredentialIndex",
  component: CredentialIndex,
  decorators: [(Story) => <div className="bg-gray-100 p-6 min-h-[600px]"><Story /></div>],
};
export default meta;
type Story = StoryObj<typeof CredentialIndex>;

/** /credentials: the signed-in user's own clients and credentials. */
export const UserCredentials: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="flex justify-end"><NewCredentialMenuButton /></div>
      <CredentialIndex />
    </div>
  ),
};

/** Project settings: owner column, keychains, project "Add new" options. */
export const ProjectCredentials: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="flex justify-end"><NewCredentialMenuButton options={projectCredentialMenuOptions(true, true)} /></div>
      <CredentialIndex project={projects[0]} />
    </div>
  ),
};

export const Empty: Story = { args: { credentials: [], oauthClients: [] } };
export const EmptyProject: Story = { args: { project: projects[0], credentials: [], oauthClients: [], keychainCredentials: [] } };
