import type { Meta, StoryObj } from "@storybook/react";
import CredentialFormModal from "./CredentialFormModal";
import OauthClientFormModal from "./OauthClientFormModal";
import KeychainCredentialFormModal from "./KeychainCredentialFormModal";
import TransferCredentialModal from "./TransferCredentialModal";
import CredentialDeletionModal from "./CredentialDeletionModal";
import ConfirmDeleteModal from "./ConfirmDeleteModal";
import { deleteKeychainMessage, deleteOauthClientMessage } from "./messages";
import { credentials, keychainCredentials, oauthClients } from "../../mock-data/credentials";
import { projects } from "../../mock-data/projects";

const meta: Meta = { title: "Credentials/Modals" };
export default meta;
type Story = StoryObj;

const noop = () => {};

export const NewCredential: Story = {
  render: () => <CredentialFormModal open onClose={noop} oauthClients={oauthClients} />,
};
export const EditCredential: Story = {
  render: () => <CredentialFormModal open onClose={noop} credential={credentials[1]} oauthClients={oauthClients} />,
};
export const EditOauthCredential: Story = {
  render: () => <CredentialFormModal open onClose={noop} credential={credentials[2]} oauthClients={oauthClients} />,
};
export const NewOauthClient: Story = {
  render: () => <OauthClientFormModal open onClose={noop} />,
};
export const EditOauthClient: Story = {
  render: () => <OauthClientFormModal open onClose={noop} client={oauthClients[0]} />,
};
export const NewKeychainCredential: Story = {
  render: () => <KeychainCredentialFormModal open onClose={noop} projectId={projects[0].id} credentials={credentials} />,
};
export const EditKeychainCredential: Story = {
  render: () => (
    <KeychainCredentialFormModal open onClose={noop} projectId={projects[0].id} keychainCredential={keychainCredentials[0]} credentials={credentials} />
  ),
};
export const TransferCredential: Story = {
  render: () => <TransferCredentialModal open onClose={noop} credential={credentials[0]} />,
};
export const RevokeTransfer: Story = {
  render: () => <TransferCredentialModal open onClose={noop} credential={credentials[2]} />,
};
export const DeleteCredential: Story = {
  render: () => <CredentialDeletionModal open onClose={noop} credential={credentials[0]} hasActivityInProjects />,
};
export const CredentialMarkedForDeletion: Story = {
  render: () => <CredentialDeletionModal open onClose={noop} credential={credentials[4]} hasActivityInProjects />,
};
export const DeleteOauthClient: Story = {
  render: () => (
    <ConfirmDeleteModal open onClose={noop} onConfirm={noop} title="Delete Oauth Client">
      {deleteOauthClientMessage(oauthClients[0].name)}
    </ConfirmDeleteModal>
  ),
};
export const DeleteKeychainCredential: Story = {
  render: () => (
    <ConfirmDeleteModal open onClose={noop} onConfirm={noop} title="Delete Keychain Credential">
      {deleteKeychainMessage(keychainCredentials[0].name)}
    </ConfirmDeleteModal>
  ),
};
