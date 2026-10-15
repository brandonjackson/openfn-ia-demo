import { useCallback, useState } from "react";
import ConfirmModal from "../ConfirmModal";
import ButtonMenu from "../ButtonMenu";
import { MenuItem } from "../Menu";
import { EmptyState } from "../Table";
import { useToast } from "../Toast";
import { CredentialsTable, KeychainCredentialsTable, OauthClientsTable } from "./CredentialTables";
import CredentialFormModal from "./CredentialFormModal";
import OauthClientFormModal from "./OauthClientFormModal";
import KeychainCredentialFormModal from "./KeychainCredentialFormModal";
import TransferCredentialModal from "./TransferCredentialModal";
import CredentialDeletionModal from "./CredentialDeletionModal";
import { deleteKeychainMessage, deleteOauthClientMessage } from "./messages";
import { useCredentialModalRequests, type NewCredentialTarget } from "./credentialModalEvents";
import type { Project } from "../../mock-data/projects";
import { currentUser } from "../../mock-data/users";
import {
  canCreateProjectCredential,
  canEditCredential,
  canEditKeychain,
  credentialsFor,
  keychainCredentialsIn,
  oauthClientsFor,
  type Credential,
  type KeychainCredential,
  type OauthClient,
} from "../../mock-data/credentials";

interface Props {
  /** Project scope (project settings › Credentials). Omit for the user's /credentials page. */
  project?: Project;
  /** Fixture overrides (stories); default to the mock-data helpers for the scope. */
  credentials?: Credential[];
  oauthClients?: OauthClient[];
  keychainCredentials?: KeychainCredential[];
}

type ActiveModal =
  | { kind: NewCredentialTarget }
  | {
      kind:
        | "edit_credential"
        | "transfer_credential"
        | "delete_credential"
        | "edit_oauth_client"
        | "delete_oauth_client"
        | "edit_keychain_credential"
        | "delete_keychain_credential";
      id: string;
    }
  | null;

/**
 * The shared credential index (annotations/shared/shared-credential-index-component.md,
 * credential_live/credential_index_component.html.heex): OAuth clients,
 * credentials and, in a project, keychain credentials, with their row
 * actions and modals. Used on /credentials and in project settings.
 *
 * The page's "Add new" menu (NewCredentialMenuButton) opens this component's
 * create modals. Every change only touches local state.
 */
export default function CredentialIndex({
  project,
  credentials: initialCredentials,
  oauthClients: initialClients,
  keychainCredentials: initialKeychains,
}: Props) {
  const [credentials, setCredentials] = useState<Credential[]>(() => initialCredentials ?? credentialsFor(project));
  const [clients, setClients] = useState<OauthClient[]>(() => initialClients ?? oauthClientsFor(project));
  const [keychains, setKeychains] = useState<KeychainCredential[]>(
    () => initialKeychains ?? (project ? keychainCredentialsIn(project) : [])
  );
  const [active, setActive] = useState<ActiveModal>(null);
  const toast = useToast();

  const showOwner = !!project;
  const canCreate = canCreateProjectCredential(project);
  const canKeychain = canEditKeychain(project);
  const defaultProjectIds = project ? [project.id] : [];

  const open = useCallback(
    (target: NewCredentialTarget) => {
      if (target === "new_keychain_credential" ? !canKeychain : !canCreate) return;
      setActive({ kind: target });
    },
    [canCreate, canKeychain]
  );
  useCredentialModalRequests(open);

  const close = () => setActive(null);
  const activeId = active && "id" in active ? active.id : null;
  const activeCredential = credentials.find((c) => c.id === activeId);
  const activeClient = clients.find((c) => c.id === activeId);
  const activeKeychain = keychains.find((k) => k.id === activeId);

  const upsert = <T extends { id: string }>(list: T[], item: T) =>
    list.some((x) => x.id === item.id) ? list.map((x) => (x.id === item.id ? item : x)) : [...list, item];
  const patchCredential = (id: string, patch: Partial<Credential>) =>
    setCredentials((list) => list.map((c) => (c.id === id ? { ...c, ...patch } : c)));

  return (
    <div id="credentials-index-component" data-annotation="shared-credential-index-component" className="space-y-4">
      <OauthClientsTable
        rows={clients}
        showOwner={showOwner}
        emptyState={
          <EmptyState
            message="No OAuth clients found."
            buttonText="Create a new OAuth client"
            onClick={() => open("new_oauth_client")}
          />
        }
        actions={(client) =>
          canEditCredential(client.ownerId) && (
            <ButtonMenu label="Actions">
              <MenuItem onClick={() => setActive({ kind: "edit_oauth_client", id: client.id })}>
                Edit
              </MenuItem>
              <MenuItem onClick={() => setActive({ kind: "delete_oauth_client", id: client.id })}>
                Delete
              </MenuItem>
            </ButtonMenu>
          )
        }
      />
      <CredentialsTable
        rows={credentials}
        showOwner={showOwner}
        emptyState={
          <EmptyState message="No credentials found." buttonText="Create a new Credential" onClick={() => open("new_credential")} />
        }
        actions={(credential) =>
          canEditCredential(credential.ownerId) && (
            <ButtonMenu label="Actions">
              <MenuItem onClick={() => setActive({ kind: "transfer_credential", id: credential.id })}>
                {credential.transferStatus === "pending" ? "Revoke Transfer" : "Transfer"}
              </MenuItem>
              <MenuItem onClick={() => setActive({ kind: "edit_credential", id: credential.id })}>
                Edit
              </MenuItem>
              {credential.scheduledDeletion && (
                <MenuItem
                  onClick={() => {
                    patchCredential(credential.id, { scheduledDeletion: null });
                    toast("Credential deletion canceled");
                  }}
                >
                  Cancel deletion
                </MenuItem>
              )}
              <MenuItem onClick={() => setActive({ kind: "delete_credential", id: credential.id })}>
                {credential.scheduledDeletion ? "Delete now" : "Delete"}
              </MenuItem>
            </ButtonMenu>
          )
        }
      />
      {project && (
        <KeychainCredentialsTable
          rows={keychains}
          credentials={credentials}
          emptyState={
            <EmptyState
              message="No keychain credentials found."
              buttonText="Create a new keychain credential"
              onClick={() => open("new_keychain_credential")}
            />
          }
          actions={(kc) =>
            canKeychain && (
              <ButtonMenu label="Actions">
                <MenuItem onClick={() => setActive({ kind: "edit_keychain_credential", id: kc.id })}>
                  Edit
                </MenuItem>
                <MenuItem onClick={() => setActive({ kind: "delete_keychain_credential", id: kc.id })}>
                  Delete
                </MenuItem>
              </ButtonMenu>
            )
          }
        />
      )}

      {active?.kind === "new_credential" && (
        <CredentialFormModal
          open
          onClose={close}
          oauthClients={clients}
          defaultProjectIds={defaultProjectIds}
          onSave={(c) => {
            setCredentials((list) => upsert(list, c));
            toast("Credential created successfully");
          }}
        />
      )}
      {active?.kind === "edit_credential" && activeCredential && (
        <CredentialFormModal
          open
          onClose={close}
          credential={activeCredential}
          oauthClients={clients}
          onSave={(c) => {
            setCredentials((list) => upsert(list, c));
            toast("Credential updated successfully");
          }}
        />
      )}
      {active?.kind === "transfer_credential" && activeCredential && (
        <TransferCredentialModal
          open
          onClose={close}
          credential={activeCredential}
          onTransfer={() => {
            patchCredential(activeCredential.id, { transferStatus: "pending" });
            toast("Credential transfer initiated. We've sent you a confirmation email.");
          }}
          onRevoke={() => {
            patchCredential(activeCredential.id, { transferStatus: null });
            toast("Transfer revoked successfully");
          }}
        />
      )}
      {active?.kind === "delete_credential" && activeCredential && (
        <CredentialDeletionModal
          open
          onClose={close}
          credential={activeCredential}
          onDelete={() => {
            setCredentials((list) => list.filter((c) => c.id !== activeCredential.id));
            // credential_deletion_modal.ex: the first delete schedules it; deleting a scheduled one is final.
            toast(activeCredential.scheduledDeletion ? "Credential deleted successfully" : "Credential scheduled for deletion");
          }}
        />
      )}
      {(active?.kind === "new_oauth_client" || (active?.kind === "edit_oauth_client" && activeClient)) && (
        <OauthClientFormModal
          open
          onClose={close}
          client={active.kind === "edit_oauth_client" ? activeClient : undefined}
          defaultProjectIds={defaultProjectIds}
          allowGlobal={currentUser.role === "superuser"}
          onSave={(c) => {
            setClients((list) => upsert(list, c));
            toast(active.kind === "edit_oauth_client" ? "Oauth client updated successfully" : "Oauth client created successfully");
          }}
        />
      )}
      {active?.kind === "delete_oauth_client" && activeClient && (
        <ConfirmModal
          open
          title="Delete Oauth Client"
          tone="danger"
          confirmLabel="Delete"
          onClose={close}
          onConfirm={() => {
            setClients((list) => list.filter((c) => c.id !== activeClient.id));
            close();
            toast("Oauth client deleted");
          }}
        >
          <p>{deleteOauthClientMessage(activeClient.name)}</p>
          <p>Do you want to proceed with this action?</p>
        </ConfirmModal>
      )}
      {project &&
        (active?.kind === "new_keychain_credential" || (active?.kind === "edit_keychain_credential" && activeKeychain)) && (
          <KeychainCredentialFormModal
            open
            onClose={close}
            projectId={project.id}
            keychainCredential={active.kind === "edit_keychain_credential" ? activeKeychain : undefined}
            credentials={credentials}
            onSave={(k) => {
              setKeychains((list) => upsert(list, k));
              toast(
                active.kind === "edit_keychain_credential"
                  ? "Keychain credential updated successfully"
                  : "Keychain credential created successfully"
              );
            }}
          />
        )}
      {active?.kind === "delete_keychain_credential" && activeKeychain && (
        <ConfirmModal
          open
          title="Delete Keychain Credential"
          tone="danger"
          confirmLabel="Delete"
          onClose={close}
          onConfirm={() => {
            setKeychains((list) => list.filter((k) => k.id !== activeKeychain.id));
            close();
            toast("Keychain credential deleted");
          }}
        >
          <p>{deleteKeychainMessage(activeKeychain.name)}</p>
          <p>Do you want to proceed with this action?</p>
        </ConfirmModal>
      )}
    </div>
  );
}
