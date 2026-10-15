import type { Meta, StoryObj } from "@storybook/react";
import CredentialIndex from "./CredentialIndex";
import NewCredentialMenuButton from "./NewCredentialMenuButton";
import { projectCredentialMenuOptions } from "./credentialModalEvents";
import { credentialsFor, keychainCredentialsIn, oauthClientsFor } from "../../mock-data/credentials";
import { projects } from "../../mock-data/projects";
import { session } from "../../mock-data/users";
import { withGrayPanel } from "../../stories/decorators";

const project = projects[0];

const meta: Meta<typeof CredentialIndex> = {
  title: "Credentials/CredentialIndex",
  component: CredentialIndex,
  decorators: [withGrayPanel],
  args: {
    credentials: credentialsFor(undefined, session.user),
    oauthClients: oauthClientsFor(undefined, session.user),
    canCreateProjectCredential: true,
    canCreateGlobalOauthClient: true,
  },
};
export default meta;
type Story = StoryObj<typeof CredentialIndex>;

/** /credentials: the signed-in user's own clients and credentials. */
export const UserCredentials: Story = {
  render: (args) => (
    <div className="space-y-4">
      <div className="flex justify-end"><NewCredentialMenuButton /></div>
      <CredentialIndex {...args} />
    </div>
  ),
};

const projectArgs = {
  project,
  credentials: credentialsFor(project, session.user),
  oauthClients: oauthClientsFor(project, session.user),
  keychainCredentials: keychainCredentialsIn(project),
  canCreateKeychainCredential: true,
  canEditKeychainCredential: true,
};

/** Project settings: owner column, keychains, project "Add new" options. */
export const ProjectCredentials: Story = {
  args: projectArgs,
  render: (args) => (
    <div className="space-y-4">
      <div className="flex justify-end"><NewCredentialMenuButton options={projectCredentialMenuOptions(true, true)} /></div>
      <CredentialIndex {...args} />
    </div>
  ),
};

/** A project viewer: no row actions on keychains, and creating is refused. */
export const ProjectViewer: Story = {
  args: { ...projectArgs, canCreateProjectCredential: false, canCreateKeychainCredential: false, canEditKeychainCredential: false },
};

export const Empty: Story = { args: { credentials: [], oauthClients: [] } };
export const EmptyProject: Story = { args: { project, credentials: [], oauthClients: [], keychainCredentials: [] } };
