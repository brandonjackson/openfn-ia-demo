import { useState } from "react";
import type { PageRoute } from "../app/ia-utils";
import Loaded from "../app/Loaded";
import { useCredentialSaves, useMyCredentials, useOAuthClients } from "../api/credentials";
import { useProjectList } from "../api/projects";
import { combine } from "../api/status";
import type { ApiToken, BackupCode, UserProfile } from "../model/page-data";
import { instanceUsers, userSettingsData } from "../fixtures/user";
import { isOpenable } from "./project-records.query";
import UserSettingsPage from "./UserSettingsPage";
import { pageFrame } from "./route.fixtures";
import { useFlags } from "../app/feature-flags";

const BASE32 = "ABCDEFGHIJKLMNPQRSTUVWXYZ234567";

function random(length: number, alphabet: string) {
  return Array.from({ length }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join("");
}

function fakeToken() {
  return `ofn_pat_demo_${random(32, "0123456789abcdef")}`;
}

/** Ten fresh backup codes, nine characters each, as Lightning makes them (no O, so none reads as a zero). */
function newBackupCodes(): BackupCode[] {
  return Array.from({ length: 10 }, () => ({ code: random(9, BASE32) }));
}

const dateFormat = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" });
const daysFromNow = (days: number) => dateFormat.format(new Date(Date.now() + days * 86_400_000));

/**
 * Feeds User settings. Your credentials (with their environments and the
 * projects they're shared with) and OAuth clients come from the API, and so
 * does the list of projects you can share with. Your profile, MFA and API
 * tokens are still played here for the session until the account moves to
 * the API.
 */
export default function UserSettingsPageQuery({ route }: { route: PageRoute }) {
  const flags = useFlags();
  const { status: projectsStatus, projects: allProjects } = useProjectList();
  const projects = allProjects.filter((p) => isOpenable(p) && !p.parentId);
  const { status: credentialsStatus, credentials } = useMyCredentials(projects.map((p) => p.id));
  const { status: clientsStatus, clients: oauthClients } = useOAuthClients();
  const credentialSaves = useCredentialSaves(credentials);
  // Your account as it stands this session: the fixtures' stand-in for the server.
  const [profile, setProfile] = useState<UserProfile>(userSettingsData.profile);
  const [tokens, setTokens] = useState<ApiToken[]>(userSettingsData.apiTokens);
  const [backupCodes, setBackupCodes] = useState<BackupCode[] | undefined>(userSettingsData.backupCodes);
  // The authenticator secret handed out but not yet confirmed with a code.
  const [pendingSecret, setPendingSecret] = useState<string>();

  return (
    <Loaded status={combine(projectsStatus, credentialsStatus, clientsStatus)} path={route.currentPath}>
      {() => (
    <UserSettingsPage
      {...pageFrame(route)}
      data={{
        ...userSettingsData,
        profile,
        credentials,
        oauthClients,
        projects: projects.map((p) => ({ id: p.id, name: p.name })),
        apiTokens: tokens,
        backupCodes: profile.mfaEnabled ? backupCodes : undefined,
        // In the demo you're the instance's superuser, so you may make global OAuth clients.
        canCreateGlobalOAuthClients: true,
        orgCredentialsOnSystems: flags.connectedSystems,
      }}
      onSaveProfile={async (details) => setProfile((p) => ({ ...p, ...details }))}
      onChangeEmail={async (email) => {
        if (instanceUsers.some((u) => u.email === email)) throw new Error("has already been taken");
        setProfile((p) => ({ ...p, pendingEmail: email }));
      }}
      // The demo has no stored password to check the current one against, so any is accepted.
      onChangePassword={async () => {}}
      onStartMfaSetup={async () => {
        const secret = random(32, BASE32);
        setPendingSecret(secret);
        const label = encodeURIComponent(`OpenFn:${profile.email}`);
        return { secret, uri: `otpauth://totp/${label}?secret=${secret}&issuer=OpenFn` };
      }}
      // There's no real authenticator behind the demo's secret, so any six digits will do.
      onEnableMfa={async () => {
        if (!pendingSecret) throw new Error("Start setting up MFA again");
        setPendingSecret(undefined);
        if (!profile.mfaEnabled) setBackupCodes(newBackupCodes());
        setProfile((p) => ({ ...p, mfaEnabled: true }));
      }}
      onDisableMfa={async () => {
        setProfile((p) => ({ ...p, mfaEnabled: false }));
        setBackupCodes(undefined);
      }}
      onRegenerateBackupCodes={async () => setBackupCodes(newBackupCodes())}
      onConnectGitHub={async () => setProfile((p) => ({ ...p, githubConnected: true }))}
      onDisconnectGitHub={async () => setProfile((p) => ({ ...p, githubConnected: false }))}
      onDeleteAccount={async (email) => {
        if (email !== profile.email) throw new Error("This email doesn't match your current email");
        setProfile((p) => ({ ...p, scheduledDeletion: daysFromNow(7) }));
      }}
      onSaveCredential={credentialSaves.save}
      onDeleteCredential={credentialSaves.remove}
      onTransferCredential={credentialSaves.transfer}
      onRevokeCredentialTransfer={credentialSaves.revokeTransfer}
      onSaveOAuthClient={credentialSaves.saveOAuthClient}
      onDeleteOAuthClient={credentialSaves.deleteOAuthClient}
      onGenerateToken={async () => {
        const token = fakeToken();
        setTokens((prev) => [{ id: `tok-${Date.now()}`, suffix: token.slice(-4), createdAt: "Just now" }, ...prev]);
        return token;
      }}
      onDeleteToken={async (id) => setTokens((prev) => prev.filter((t) => t.id !== id))}
    />
      )}
    </Loaded>
  );
}
