import { useState } from "react";
import type { PageRoute } from "../app/ia-utils";
import type { ApiToken, BackupCode, OAuthClient, UserCredential, UserProfile } from "../model/page-data";
import { withoutSecrets } from "../model/credentials";
import { instanceUsers, userSettingsData } from "../fixtures/user";
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
const today = () => dateFormat.format(new Date());
const daysFromNow = (days: number) => dateFormat.format(new Date(Date.now() + days * 86_400_000));

/**
 * Feeds every section of User settings from fixtures, and plays the server
 * for everything you can do there: each action applies Lightning's rules,
 * changes this session's copy of the records, and the page redraws from it.
 */
export default function UserSettingsPageFixtures({ route }: { route: PageRoute }) {
  const flags = useFlags();
  // Your account as it stands this session: the fixtures' stand-in for the server.
  const [profile, setProfile] = useState<UserProfile>(userSettingsData.profile);
  const [credentials, setCredentials] = useState<UserCredential[]>(userSettingsData.credentials);
  const [oauthClients, setOAuthClients] = useState<OAuthClient[]>(userSettingsData.oauthClients);
  const [tokens, setTokens] = useState<ApiToken[]>(userSettingsData.apiTokens);
  const [backupCodes, setBackupCodes] = useState<BackupCode[] | undefined>(userSettingsData.backupCodes);
  // The authenticator secret handed out but not yet confirmed with a code.
  const [pendingSecret, setPendingSecret] = useState<string>();

  const projectName = (id: string) => userSettingsData.projects.find((p) => p.id === id)?.name ?? id;
  const schemaOf = (id: string) => userSettingsData.credentialSchemas.find((s) => s.id === id);

  return (
    <UserSettingsPage
      {...pageFrame(route)}
      data={{
        ...userSettingsData,
        profile,
        credentials,
        oauthClients,
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
      onSaveCredential={async (draft) => {
        if (draft.externalId) {
          const clash = credentials.find(
            (c) => c.id !== draft.id && c.externalId === draft.externalId && c.projectIds.some((p) => draft.projectIds.includes(p))
          );
          if (clash) throw new Error("Another credential with the same external ID already exists in this project");
        }
        // Secrets go to the server and never come back.
        const environments = draft.environments.map((e) => ({ ...e, values: withoutSecrets(e.values, schemaOf(draft.schema)) }));
        if (draft.id) {
          setCredentials((all) => all.map((c) => (c.id === draft.id ? { ...c, ...draft, id: c.id, environments } : c)));
        } else {
          setCredentials((all) => [...all, { ...draft, id: `ucred-${Date.now()}`, environments, createdAt: today() }]);
        }
      }}
      onDeleteCredential={async (id) => setCredentials((all) => all.filter((c) => c.id !== id))}
      onTransferCredential={async (id, email) => {
        const credential = credentials.find((c) => c.id === id);
        if (!credential) throw new Error("Credential not found");
        if (email === profile.email) throw new Error("You cannot transfer a credential to yourself");
        const receiver = instanceUsers.find((u) => u.email === email);
        if (!receiver) throw new Error("User does not exist");
        const blocking = credential.projectIds.filter((p) => !receiver.projectIds.includes(p));
        if (blocking.length > 0)
          throw new Error(`User doesn't have access to these projects: ${blocking.map(projectName).join(", ")}`);
        setCredentials((all) => all.map((c) => (c.id === id ? { ...c, transferPendingTo: email } : c)));
      }}
      onRevokeCredentialTransfer={async (id) =>
        setCredentials((all) => all.map((c) => (c.id === id ? { ...c, transferPendingTo: undefined } : c)))
      }
      onSaveOAuthClient={async ({ clientSecret: _secret, ...draft }) => {
        void _secret; // The secret goes to the server and never comes back.
        if (draft.id) setOAuthClients((all) => all.map((c) => (c.id === draft.id ? { ...c, ...draft, id: c.id } : c)));
        else setOAuthClients((all) => [...all, { ...draft, id: `oauth-${Date.now()}` }]);
      }}
      onDeleteOAuthClient={async (id) => setOAuthClients((all) => all.filter((c) => c.id !== id))}
      onGenerateToken={async () => {
        const token = fakeToken();
        setTokens((prev) => [{ id: `tok-${Date.now()}`, suffix: token.slice(-4), createdAt: "Just now" }, ...prev]);
        return token;
      }}
      onDeleteToken={async (id) => setTokens((prev) => prev.filter((t) => t.id !== id))}
    />
  );
}
