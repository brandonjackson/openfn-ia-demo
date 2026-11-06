import type { PageRoute } from "../app/ia-utils";
import Loaded from "../app/Loaded";
import { useCredentialSaves, useMyCredentials, useOAuthClients } from "../api/credentials";
import { useAccountSaves, useApiTokens, useBackupCodes, useMe } from "../api/account";
import { useProjectList } from "../api/projects";
import { combine } from "../api/status";
import { userSettingsData } from "../fixtures/user";
import { isOpenable } from "../model/projects";
import UserSettingsPage from "./UserSettingsPage";
import { pageFrame } from "../app/page-frame";
import { useFlags } from "../app/feature-flags";

/**
 * Feeds User settings from the API: your profile, email, password and
 * account deletion; your credentials (with their environments and the
 * projects they're shared with) and OAuth clients; your API tokens; MFA and
 * its backup codes; and your GitHub link. The demo's session counts as
 * stepped up, so the current password the forms ask for isn't checked.
 */
export default function UserSettingsPageQuery({ route }: { route: PageRoute }) {
  const flags = useFlags();
  const { status: meStatus, me } = useMe();
  const { status: projectsStatus, projects: allProjects } = useProjectList();
  const projects = allProjects.filter((p) => isOpenable(p) && !p.parentId);
  const { status: credentialsStatus, credentials } = useMyCredentials(projects.map((p) => p.id));
  const { status: clientsStatus, clients: oauthClients } = useOAuthClients();
  const { status: tokensStatus, tokens } = useApiTokens();
  const { status: codesStatus, backupCodes } = useBackupCodes();
  const credentialSaves = useCredentialSaves(credentials);
  const account = useAccountSaves(me?.id ?? "");

  return (
    <Loaded status={combine(meStatus, projectsStatus, credentialsStatus, clientsStatus, tokensStatus, codesStatus)} path={route.currentPath}>
      {() => (
        <UserSettingsPage
          {...pageFrame(route)}
          data={{
            ...userSettingsData,
            profile: me!,
            credentials,
            oauthClients,
            projects: projects.map((p) => ({ id: p.id, name: p.name })),
            apiTokens: tokens,
            backupCodes,
            canCreateGlobalOAuthClients: me!.isSuperuser,
            orgCredentialsOnSystems: flags.connectedSystems,
          }}
          onSaveProfile={account.saveProfile}
          onChangeEmail={(email) => account.changeEmail(email)}
          onChangePassword={(password) => account.changePassword(password)}
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
          onSaveCredential={credentialSaves.save}
          onDeleteCredential={credentialSaves.remove}
          onTransferCredential={credentialSaves.transfer}
          onRevokeCredentialTransfer={credentialSaves.revokeTransfer}
          onSaveOAuthClient={credentialSaves.saveOAuthClient}
          onDeleteOAuthClient={credentialSaves.deleteOAuthClient}
          onGenerateToken={account.generateToken}
          onDeleteToken={account.deleteToken}
        />
      )}
    </Loaded>
  );
}
