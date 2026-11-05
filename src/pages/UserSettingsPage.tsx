import { useState } from "react";
import { UserCircle, KeyRound, Terminal, Plus, Trash2, GitBranch, ShieldCheck, Fingerprint, AppWindow } from "lucide-react";
import type { PageProps } from "../model/ia-tree";
import type {
  ApiToken,
  CredentialDraft,
  MfaSetup,
  OAuthClient,
  OAuthClientDraft,
  ProfileDetails,
  UserCredential,
  UserSettingsPageData,
} from "../model/page-data";
import SettingsLayout from "../components/patterns/SettingsLayout";
import type { SettingsNavItem } from "../components/primitives/SettingsNav";
import Breadcrumbs from "../components/domain/Breadcrumbs";
import ApiTokenTable from "../components/domain/ApiTokenTable";
import BackupCodes from "../components/domain/BackupCodes";
import ChangeEmailForm from "../components/domain/ChangeEmailForm";
import ChangePasswordForm from "../components/domain/ChangePasswordForm";
import CredentialFormModal from "../components/domain/CredentialFormModal";
import CredentialTable from "../components/domain/CredentialTable";
import DeleteAccountModal from "../components/domain/DeleteAccountModal";
import MfaSetupFlow from "../components/domain/MfaSetupFlow";
import OAuthClientModal from "../components/domain/OAuthClientModal";
import OAuthClientTable from "../components/domain/OAuthClientTable";
import ProfileDetailsForm from "../components/domain/ProfileDetailsForm";
import TransferCredentialModal from "../components/domain/TransferCredentialModal";
import Badge from "../components/primitives/Badge";
import Button from "../components/primitives/Button";
import Callout from "../components/primitives/Callout";
import Card from "../components/primitives/Card";
import ConfirmModal from "../components/primitives/ConfirmModal";
import CopyValue from "../components/primitives/CopyValue";
import EmptyState from "../components/primitives/EmptyState";
import Inline from "../components/primitives/Inline";
import SectionHeading from "../components/primitives/SectionHeading";
import Stack from "../components/primitives/Stack";
import Text from "../components/primitives/Text";
import TextLink from "../components/primitives/TextLink";

/* ------------------------------------------------------------------ */
/*  Contract                                                           */
/* ------------------------------------------------------------------ */

export interface UserSettingsPageProps extends PageProps<UserSettingsPageData> {
  /** Saves your name and contact preference. */
  onSaveProfile: (details: ProfileDetails) => Promise<void>;
  /** Asks to move to a new email, confirmed with your password; rejects with a message (e.g. "has already been taken"). */
  onChangeEmail: (email: string, currentPassword: string) => Promise<void>;
  /** Sets a new password, confirmed with the current one; rejects with a message if the current one is wrong. */
  onChangePassword: (password: string, currentPassword: string) => Promise<void>;
  /** Mints a new authenticator secret to scan, without turning anything on yet. */
  onStartMfaSetup: () => Promise<MfaSetup>;
  /** Checks a code from the app against the new secret and turns MFA on (or moves it to the new device); rejects if the code is wrong. */
  onEnableMfa: (code: string) => Promise<void>;
  /** Turns MFA off and throws away the backup codes. */
  onDisableMfa: () => Promise<void>;
  /** Replaces your backup codes with a new set. */
  onRegenerateBackupCodes: () => Promise<void>;
  /** Links your GitHub account (in Lightning, a trip through GitHub's sign-in). */
  onConnectGitHub: () => Promise<void>;
  /** Unlinks your GitHub account. */
  onDisconnectGitHub: () => Promise<void>;
  /** Schedules your account for deletion, once you've typed its email; rejects if the email doesn't match. */
  onDeleteAccount: (email: string) => Promise<void>;
  /** Creates a credential (no `id`) or saves changes to one. Secrets left blank keep what's saved. */
  onSaveCredential: (draft: CredentialDraft) => Promise<void>;
  /** Deletes a credential, taking it off every project and step that used it. */
  onDeleteCredential: (id: string) => Promise<void>;
  /** Starts handing a credential to someone else by email; rejects with a message if they can't take it. */
  onTransferCredential: (id: string, email: string) => Promise<void>;
  /** Cancels a pending transfer, keeping the credential yours. */
  onRevokeCredentialTransfer: (id: string) => Promise<void>;
  /** Registers an OAuth client (no `id`) or saves changes to one. A blank secret keeps the saved one. */
  onSaveOAuthClient: (draft: OAuthClientDraft) => Promise<void>;
  /** Deletes an OAuth client; credentials made with it stop working. */
  onDeleteOAuthClient: (id: string) => Promise<void>;
  /** Generates a personal access token and resolves with it: the only time it's ever shown. */
  onGenerateToken: () => Promise<string>;
  /** Deletes a token, so it stops working. */
  onDeleteToken: (id: string) => Promise<void>;
}

/* ------------------------------------------------------------------ */
/*  Section menu                                                       */
/* ------------------------------------------------------------------ */

const BASE_PATH = "/user-settings";

const navItems: SettingsNavItem[] = [
  { id: "profile", label: "Profile", icon: UserCircle, to: `${BASE_PATH}/profile` },
  { id: "credentials", label: "Credentials", icon: KeyRound, to: `${BASE_PATH}/credentials` },
  { id: "api-tokens", label: "API tokens", icon: Terminal, to: `${BASE_PATH}/api-tokens` },
];

/* ------------------------------------------------------------------ */
/*  Profile section                                                    */
/* ------------------------------------------------------------------ */

function MfaCard({ data, ...actions }: { data: UserSettingsPageData } & UserSettingsPageProps) {
  const { profile } = data;
  // UI state: the secret being set up, whether codes were just made, and which confirm is open.
  const [setup, setSetup] = useState<MfaSetup | null>(null);
  const [freshCodes, setFreshCodes] = useState(false);
  const [confirmDisable, setConfirmDisable] = useState(false);

  const start = async () => setSetup(await actions.onStartMfaSetup());

  return (
    <>
      <Card
        title="Multi-factor authentication"
        description="Add a second step to sign in with an authenticator app. Some projects require it."
      >
        {setup ? (
          <MfaSetupFlow
            setup={setup}
            onCancel={() => setSetup(null)}
            onVerify={async (code) => {
              const wasEnabled = profile.mfaEnabled;
              await actions.onEnableMfa(code);
              setSetup(null);
              setFreshCodes(!wasEnabled);
            }}
          />
        ) : profile.mfaEnabled ? (
          <Stack gap="md">
            <Inline gap="sm" wrap>
              <Badge label="Enabled" tone="green" icon={ShieldCheck} />
              <Text tone="muted">You have configured an authenticator app to get two-factor authentication codes.</Text>
            </Inline>
            <Inline gap="sm" wrap>
              <Button variant="secondary" size="sm" onClick={start}>
                Set up another device instead
              </Button>
              <Button variant="outline-danger" size="sm" onClick={() => setConfirmDisable(true)}>
                Disable MFA
              </Button>
            </Inline>
          </Stack>
        ) : (
          <Inline>
            <Button icon={ShieldCheck} onClick={start}>
              Set up MFA
            </Button>
          </Inline>
        )}
      </Card>

      {profile.mfaEnabled && data.backupCodes && (
        <Card title="Backup codes" description="One-time codes for signing in without your authenticator app.">
          <BackupCodes
            codes={data.backupCodes}
            fresh={freshCodes}
            onRegenerate={async () => {
              await actions.onRegenerateBackupCodes();
              setFreshCodes(true);
            }}
          />
        </Card>
      )}

      <ConfirmModal
        open={confirmDisable}
        title="Disable MFA"
        confirmLabel="Disable"
        onClose={() => setConfirmDisable(false)}
        onConfirm={async () => {
          await actions.onDisableMfa();
          setConfirmDisable(false);
          setFreshCodes(false);
        }}
      >
        <p>
          Are you sure you want to disable MFA on your account? This will make your account less secure. Should an
          attacker get hold of your password, there will be nothing preventing them from accessing your account.
        </p>
      </ConfirmModal>
    </>
  );
}

function ProfileSection(props: UserSettingsPageProps) {
  const { profile } = props.data;
  const [confirmDisconnect, setConfirmDisconnect] = useState(false);
  const [deleting, setDeleting] = useState(false);

  return (
    <Stack gap="xl">
      <SectionHeading
        title={`${profile.firstName} ${profile.lastName}`}
        description={`${profile.email} · Member since ${profile.createdAt}`}
      />

      {profile.scheduledDeletion && (
        <Callout variant="danger" title="Your account is scheduled for deletion">
          It will be deleted on {profile.scheduledDeletion}, along with your credentials. Contact your instance
          administrator to cancel.
        </Callout>
      )}

      <ProfileDetailsForm details={profile} onSave={props.onSaveProfile} />
      <ChangeEmailForm currentEmail={profile.email} pendingEmail={profile.pendingEmail} onChangeEmail={props.onChangeEmail} />
      <ChangePasswordForm onChangePassword={props.onChangePassword} />
      <MfaCard {...props} />

      <Card title="GitHub access" description="Link your GitHub account to manage version control across your projects.">
        {profile.githubConnected ? (
          <Inline justify="between" wrap>
            <Badge label="Connected" tone="green" icon={GitBranch} />
            <Button variant="outline-danger" size="sm" onClick={() => setConfirmDisconnect(true)}>
              Disconnect from GitHub
            </Button>
          </Inline>
        ) : (
          <Inline>
            <Button variant="dark" icon={GitBranch} onClick={() => void props.onConnectGitHub()}>
              Connect your GitHub account
            </Button>
          </Inline>
        )}
      </Card>

      {!profile.scheduledDeletion && (
        <Callout variant="danger" title="Delete account">
          <Text block>Deleting your account is irreversible, and your credentials go with it.</Text>
          <Inline>
            <Button variant="danger" icon={Trash2} onClick={() => setDeleting(true)}>
              Delete my account
            </Button>
          </Inline>
        </Callout>
      )}

      <ConfirmModal
        open={confirmDisconnect}
        title="Disconnect from GitHub?"
        confirmLabel="Disconnect"
        onClose={() => setConfirmDisconnect(false)}
        onConfirm={async () => {
          await props.onDisconnectGitHub();
          setConfirmDisconnect(false);
        }}
      >
        <p>
          You are about to disconnect your OpenFn account from GitHub. Until you reconnect, you will not be able to set up
          or modify version control for your projects.
        </p>
      </ConfirmModal>

      {deleting && (
        <DeleteAccountModal
          open
          onClose={() => setDeleting(false)}
          onDelete={async (email) => {
            await props.onDeleteAccount(email);
            setDeleting(false);
          }}
        />
      )}
    </Stack>
  );
}

/* ------------------------------------------------------------------ */
/*  Credentials section                                                */
/* ------------------------------------------------------------------ */

type CredentialDialog =
  | { kind: "new-credential" }
  | { kind: "edit-credential"; credential: UserCredential }
  | { kind: "transfer"; credential: UserCredential }
  | { kind: "delete-credential"; credential: UserCredential }
  | { kind: "new-oauth" }
  | { kind: "edit-oauth"; client: OAuthClient }
  | { kind: "delete-oauth"; client: OAuthClient };

function CredentialsSection(props: UserSettingsPageProps) {
  const { data } = props;
  // UI state: the open dialog, and a note on what the last action did (Lightning's flash).
  const [dialog, setDialog] = useState<CredentialDialog | null>(null);
  const [notice, setNotice] = useState<string>();
  const close = () => setDialog(null);
  const done = (message: string) => {
    setDialog(null);
    setNotice(message);
  };

  return (
    <Stack gap="xl">
      <Stack gap="md">
        <SectionHeading
          title="Credentials"
          description="Credentials you own. Share them with any project you collaborate on."
          action={
            <Button size="sm" icon={Plus} onClick={() => setDialog({ kind: "new-credential" })}>
              New credential
            </Button>
          }
        />

        {notice && <Callout variant="success" title={notice} />}

        {(data.orgCredentialsOnSystems ?? true) && (
          <Callout variant="info" title="Organization credentials live in Systems">
            Credentials your whole organization shares are managed on each{" "}
            <TextLink to="/connected-systems" variant="inline">
              connected system
            </TextLink>
            .
          </Callout>
        )}

        {data.credentials.length > 0 ? (
          <CredentialTable
            credentials={data.credentials}
            schemas={data.credentialSchemas}
            projects={data.projects}
            onEdit={(credential) => setDialog({ kind: "edit-credential", credential })}
            onTransfer={(credential) => setDialog({ kind: "transfer", credential })}
            onDelete={(credential) => setDialog({ kind: "delete-credential", credential })}
          />
        ) : (
          <EmptyState
            icon={KeyRound}
            title="No credentials yet"
            description="Credentials hold the logins and keys your workflows use to reach other systems."
            action={
              <Button icon={Plus} onClick={() => setDialog({ kind: "new-credential" })}>
                New credential
              </Button>
            }
          />
        )}
      </Stack>

      <Stack gap="md">
        <SectionHeading
          title="OAuth clients"
          description="Apps registered with external systems so credentials can sign in with OAuth."
          action={
            <Button variant="secondary" size="sm" icon={Plus} onClick={() => setDialog({ kind: "new-oauth" })}>
              New OAuth client
            </Button>
          }
        />
        {data.oauthClients.length > 0 ? (
          <OAuthClientTable
            clients={data.oauthClients}
            projects={data.projects}
            onEdit={(client) => setDialog({ kind: "edit-oauth", client })}
            onDelete={(client) => setDialog({ kind: "delete-oauth", client })}
          />
        ) : (
          <EmptyState icon={AppWindow} title="No OAuth clients yet" description="Register an app to let credentials sign in with OAuth." />
        )}
      </Stack>

      {(dialog?.kind === "new-credential" || dialog?.kind === "edit-credential") && (
        <CredentialFormModal
          open
          credential={dialog.kind === "edit-credential" ? dialog.credential : undefined}
          schemas={data.credentialSchemas}
          projects={data.projects}
          onClose={close}
          onSave={async (draft) => {
            await props.onSaveCredential(draft);
            done(draft.id ? "Credential updated successfully" : "Credential created successfully");
          }}
        />
      )}

      {dialog?.kind === "transfer" && (
        <TransferCredentialModal
          open
          credential={dialog.credential}
          onClose={close}
          onTransfer={async (email) => {
            await props.onTransferCredential(dialog.credential.id, email);
            done("Credential transfer initiated. We've emailed the new owner a link to accept it.");
          }}
          onRevoke={async () => {
            await props.onRevokeCredentialTransfer(dialog.credential.id);
            done("Transfer revoked successfully");
          }}
        />
      )}

      <ConfirmModal
        open={dialog?.kind === "delete-credential"}
        title="Delete credential"
        confirmLabel="Delete credential"
        onClose={close}
        onConfirm={async () => {
          if (dialog?.kind !== "delete-credential") return;
          await props.onDeleteCredential(dialog.credential.id);
          done(`"${dialog.credential.name}" deleted`);
        }}
      >
        <p>
          Deleting this credential will immediately remove it from all steps and projects. If you later restore it, you
          will need to share it with projects and attach it to steps again.
        </p>
        <p>Are you sure you'd like to delete the credential?</p>
      </ConfirmModal>

      {(dialog?.kind === "new-oauth" || dialog?.kind === "edit-oauth") && (
        <OAuthClientModal
          open
          client={dialog.kind === "edit-oauth" ? dialog.client : undefined}
          projects={data.projects}
          canMakeGlobal={data.canCreateGlobalOAuthClients}
          onClose={close}
          onSave={async (draft) => {
            await props.onSaveOAuthClient(draft);
            done(draft.id ? "OAuth client updated successfully" : "OAuth client created successfully");
          }}
        />
      )}

      <ConfirmModal
        open={dialog?.kind === "delete-oauth"}
        title="Delete OAuth client"
        confirmLabel="Delete"
        onClose={close}
        onConfirm={async () => {
          if (dialog?.kind !== "delete-oauth") return;
          await props.onDeleteOAuthClient(dialog.client.id);
          done(`"${dialog.client.name}" deleted`);
        }}
      >
        <p>
          You are about to delete the OAuth client "{dialog?.kind === "delete-oauth" ? dialog.client.name : ""}", which may
          be used in other projects. All steps that depend on this client will fail.
        </p>
        <p>Do you want to proceed?</p>
      </ConfirmModal>
    </Stack>
  );
}

/* ------------------------------------------------------------------ */
/*  API tokens section                                                 */
/* ------------------------------------------------------------------ */

function ApiTokensSection({ data, onGenerateToken, onDeleteToken }: UserSettingsPageProps) {
  // UI state: the token just made (shown once), and the one waiting on a delete confirm.
  const [newToken, setNewToken] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<ApiToken | null>(null);

  const generate = async () => setNewToken(await onGenerateToken());

  return (
    <Stack gap="lg">
      <SectionHeading
        title="API tokens"
        description="Personal access tokens let the OpenFn CLI and API act as you."
        action={
          <Button size="sm" icon={Plus} onClick={generate}>
            Generate new token
          </Button>
        }
      />

      {newToken && (
        <Callout variant="warning" title="Copy your token now. You won't be able to see it again.">
          <CopyValue value={newToken} label="Copy token" />
        </Callout>
      )}

      {data.apiTokens.length > 0 ? (
        <ApiTokenTable tokens={data.apiTokens} onDelete={setDeleting} />
      ) : (
        <EmptyState
          icon={Fingerprint}
          title="No personal access tokens"
          description="Get started by creating a new access token."
          action={
            <Button icon={Plus} onClick={generate}>
              Generate new token
            </Button>
          }
        />
      )}

      <ConfirmModal
        open={deleting !== null}
        title="Delete API access token"
        confirmLabel="Delete token"
        onClose={() => setDeleting(null)}
        onConfirm={async () => {
          if (!deleting) return;
          await onDeleteToken(deleting.id);
          setDeleting(null);
        }}
      >
        <p>Any applications or scripts using this token will no longer be able to access the API.</p>
        <p>Are you sure you want to delete the token ending {deleting?.suffix}?</p>
      </ConfirmModal>
    </Stack>
  );
}

/* ------------------------------------------------------------------ */
/*  Main template                                                      */
/* ------------------------------------------------------------------ */

export default function UserSettingsPage(props: UserSettingsPageProps) {
  const { node, ancestors } = props;
  // The /user-settings root shows the first section.
  const activeId = navItems.some((item) => item.id === node.id) ? node.id : navItems[0].id;

  return (
    <SettingsLayout
      breadcrumbs={<Breadcrumbs ancestors={ancestors.map((a) => ({ label: a.node.label, path: a.path }))} current={node.label} />}
      title="User settings"
      description="Manage your profile, personal credentials and API tokens."
      navItems={navItems}
      activeId={activeId}
    >
      {activeId === "profile" && <ProfileSection {...props} />}
      {activeId === "credentials" && <CredentialsSection {...props} />}
      {activeId === "api-tokens" && <ApiTokensSection {...props} />}
    </SettingsLayout>
  );
}
