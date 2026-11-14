import type { PageRoute } from "../../app/ia-utils";
import Loaded from "../../app/Loaded";
import { useCredentialSaves, useCredentialSchemaLoader, useCredentialSchemas, useMyCredentials, useOAuthClients } from "../../api/credentials";
import { useAccountSaves, useApiTokens, useBackupCodes, useMe } from "../../api/account";
import { useProjectList } from "../../api/projects";
import { combine } from "../../api/status";
import { isOpenable } from "../../model/projects";
import UserSettingsPage from "./UserSettingsPage";
import { pageFrame } from "../../app/page-frame";
import { useFlags } from "../../app/feature-flags";
import { useAnnounceOutcome } from "../../app/announce";

/**
 * Feeds User settings from the API: your profile, email, password and
 * account deletion; your credentials (with their environments and the
 * projects they're shared with) and OAuth clients; your API tokens; MFA and
 * its backup codes; your GitHub link; and the kinds of credential you can
 * make, from the credential schemas' list (a kind's fields are fetched
 * once it's picked). A new email or password sends the current password
 * the form asks for to step the session up first.
 */
export default function UserSettingsPageQuery({ route }: { route: PageRoute }) {
  const flags = useFlags();
  const { status: meStatus, me } = useMe();
  const { status: projectsStatus, projects: allProjects } = useProjectList();
  const projects = allProjects.filter((p) => isOpenable(p) && !p.parentId);
  const { status: credentialsStatus, credentials } = useMyCredentials(projects.map((p) => p.id));
  const { status: clientsStatus, clients: oauthClients } = useOAuthClients();
  const { status: schemasStatus, schemas: credentialSchemas } = useCredentialSchemas();
  const loadCredentialSchema = useCredentialSchemaLoader();
  const { status: tokensStatus, tokens } = useApiTokens();
  const { status: codesStatus, backupCodes } = useBackupCodes();
  const credentialSaves = useCredentialSaves(credentials);
  const account = useAccountSaves(me?.id ?? "");
  const announcing = useAnnounceOutcome();
  const credentialName = (id: string) => credentials.find((c) => c.id === id)?.name ?? "The credential";
  const clientName = (id: string) => oauthClients.find((c) => c.id === id)?.name ?? "The OAuth client";

  return (
    <Loaded status={combine(meStatus, projectsStatus, credentialsStatus, clientsStatus, schemasStatus, tokensStatus, codesStatus)} path={route.currentPath}>
      {() => (
        <UserSettingsPage
          {...pageFrame(route)}
          data={{
            profile: me!,
            credentials,
            credentialSchemas,
            oauthClients,
            projects: projects.map((p) => ({ id: p.id, name: p.name })),
            apiTokens: tokens,
            backupCodes,
            canCreateGlobalOAuthClients: me!.isSuperuser,
            orgCredentialsOnSystems: flags.connectedSystems,
          }}
          onSaveProfile={account.saveProfile}
          onChangeEmail={(email, currentPassword) => account.changeEmail(email, currentPassword)}
          onChangePassword={(password, currentPassword) => account.changePassword(password, currentPassword)}
          onStartMfaSetup={account.startMfaSetup}
          onEnableMfa={(code) => account.enableMfa(code)}
          onDisableMfa={account.disableMfa}
          onRegenerateBackupCodes={account.regenerateBackupCodes}
          onConnectGitHub={account.connectGitHub}
          onDisconnectGitHub={account.disconnectGitHub}
          onDeleteAccount={async (email) => {
            if (email !== me!.email) throw new Error("This email doesn't match your current email");
            await account.deleteAccount();
          }}
          onLoadCredentialSchema={loadCredentialSchema}
          // Forms show a refusal under their fields, so only their success is announced.
          onSaveCredential={(draft) => announcing(credentialSaves.save(draft), { success: draft.id ? "Credential updated." : "Credential created." })}
          onDeleteCredential={(id) => announcing(credentialSaves.remove(id), { success: `Deleted "${credentialName(id)}".`, failure: `"${credentialName(id)}" wasn't deleted` })}
          onTransferCredential={(id, email) =>
            announcing(credentialSaves.transfer(id, email), { success: "Credential transfer started. We've emailed the new owner a link to accept it." })
          }
          onRevokeCredentialTransfer={(id) => announcing(credentialSaves.revokeTransfer(id), { success: "Transfer revoked." })}
          onSaveOAuthClient={(draft) => announcing(credentialSaves.saveOAuthClient(draft), { success: draft.id ? "OAuth client updated." : "OAuth client created." })}
          onDeleteOAuthClient={(id) =>
            announcing(credentialSaves.deleteOAuthClient(id), { success: `Deleted "${clientName(id)}".`, failure: `"${clientName(id)}" wasn't deleted` })
          }
          onGenerateToken={account.generateToken}
          onDeleteToken={account.deleteToken}
        />
      )}
    </Loaded>
  );
}
