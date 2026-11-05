import type {
  ApiToken,
  BackupCode,
  MfaSetup,
  OAuthClient,
  UserCredential,
  UserProfile,
  UserSettingsPageData,
} from "../model/page-data";
import { credentialSchemas } from "./credential-schemas";
import { projectOptions } from "./projects";

export const currentUser: UserProfile = {
  firstName: "Jane",
  lastName: "Doe",
  email: "jane.doe@example.org",
  createdAt: "12 March 2024",
  contactPreference: "Critical only",
  mfaEnabled: false,
  githubConnected: false,
};

/** Whether the current user is a superuser, who can reach Admin settings and every project on the instance. */
export const currentUserIsSuperuser = true;

/** The OpenFn instance the current user is signed in to (named after the team that runs it). */
export const currentInstance = {
  name: "Sim DTU",
  initials: "SD",
};

/**
 * Other people on the instance and the projects each belongs to, so a
 * credential can only be handed to someone who's in every project that uses
 * it (Lightning's rule for transfers).
 */
export const instanceUsers: { email: string; name: string; projectIds: string[] }[] = [
  { email: "jane.doe@example.org", name: "Jane Doe", projectIds: projectOptions.map((p) => p.id) },
  { email: "adiallo@example.org", name: "Amadou Diallo", projectIds: projectOptions.map((p) => p.id) },
  { email: "jsmith@example.org", name: "John Smith", projectIds: ["project-b"] },
  { email: "bwilson@example.org", name: "Beth Wilson", projectIds: ["project-a", "project-b"] },
];

// Secret fields (passwords, tokens, keys) never come back from the server, so
// none are here: the form shows them blank, and leaving them blank keeps them.
export const userCredentials: UserCredential[] = [
  {
    id: "ucred-dhis2-play",
    name: "DHIS2 Play (personal)",
    schema: "dhis2",
    projectIds: ["project-a"],
    environments: [
      { environment: "staging", values: { hostUrl: "https://play.im.dhis2.org/stable-2-41-1", username: "demo-user", apiVersion: "41" } },
    ],
    createdAt: "2 Apr 2024",
  },
  {
    id: "ucred-commcare",
    name: "CommCare mock server",
    schema: "commcare",
    externalId: "cc-mock-01",
    projectIds: ["project-b"],
    environments: [
      { environment: "mock", values: { hostUrl: "https://commcare-mock.example.org", domain: "demo-project", username: "demo-user" } },
    ],
    createdAt: "18 Jun 2024",
  },
  {
    id: "ucred-sheets",
    name: "Google Sheets reporting",
    schema: "googlesheets",
    projectIds: ["project-a", "project-b"],
    environments: [{ environment: "production", values: {} }],
    createdAt: "9 Jan 2025",
  },
  {
    id: "ucred-lab-api",
    name: "Malawi lab results API",
    schema: "http",
    projectIds: ["malawi-chw-referrals"],
    environments: [
      { environment: "production", values: { baseUrl: "https://lab-api.example.org", username: "openfn-demo" } },
      { environment: "staging", values: { baseUrl: "https://lab-api-staging.example.org", username: "openfn-demo" } },
    ],
    createdAt: "3 Mar 2026",
    transferPendingTo: "adiallo@example.org",
  },
];

export const userOAuthClients: OAuthClient[] = [
  {
    id: "oauth-google",
    name: "Google Workspace",
    authorizationEndpoint: "https://accounts.google.com/o/oauth2/v2/auth",
    tokenEndpoint: "https://oauth2.googleapis.com/token",
    revocationEndpoint: "https://oauth2.googleapis.com/revoke",
    userinfoEndpoint: "https://openidconnect.googleapis.com/v1/userinfo",
    clientId: "demo-client-id.apps.googleusercontent.com",
    mandatoryScopes: ["openid", "email"],
    optionalScopes: ["https://www.googleapis.com/auth/spreadsheets"],
    scopesDocUrl: "https://developers.google.com/identity/protocols/oauth2/scopes",
    global: true,
    projectIds: [],
  },
  {
    id: "oauth-salesforce",
    name: "Salesforce sandbox app",
    authorizationEndpoint: "https://test.salesforce.com/services/oauth2/authorize",
    tokenEndpoint: "https://test.salesforce.com/services/oauth2/token",
    revocationEndpoint: "https://test.salesforce.com/services/oauth2/revoke",
    clientId: "demo-salesforce-consumer-key",
    mandatoryScopes: ["api", "refresh_token"],
    optionalScopes: [],
    global: false,
    projectIds: ["project-b"],
  },
];

export const userApiTokens: ApiToken[] = [
  { id: "tok-1", suffix: "a91f", createdAt: "4 Feb 2025", lastUsedAt: "8 Oct 2026" },
  { id: "tok-2", suffix: "07cc", createdAt: "21 Aug 2025" },
];

/** A secret for setting up an authenticator app: an obvious fake. */
export const demoMfaSetup: MfaSetup = {
  secret: "DEMOSECRETNOTREAL2345",
  uri: "otpauth://totp/OpenFn:jane.doe%40example.org?secret=DEMOSECRETNOTREAL2345&issuer=OpenFn",
};

/** Backup codes as they'd look once multi-factor authentication is on: obvious fakes, one used. */
export const demoBackupCodes: BackupCode[] = [
  "DEMO2K7QA",
  "DEMO9XW4B",
  "DEMOH3TZC",
  "DEMOL5RND",
  "DEMOP8VJE",
  "DEMOQ2MXF",
  "DEMOU6YKG",
  "DEMOW4CSH",
  "DEMOX7BFJ",
  "DEMOZ1GHK",
].map((code, i) => (i === 3 ? { code, usedAt: "3 Oct 2026" } : { code }));

export const userSettingsData: UserSettingsPageData = {
  pageType: "user-settings",
  profile: currentUser,
  credentials: userCredentials,
  credentialSchemas,
  oauthClients: userOAuthClients,
  projects: projectOptions,
  apiTokens: userApiTokens,
};
