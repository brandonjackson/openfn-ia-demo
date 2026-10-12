import type {
  ApiToken,
  OAuthClient,
  UserCredential,
  UserProfile,
  UserSettingsPageData,
} from "../page-data";

export const currentUser: UserProfile = {
  firstName: "Jane",
  lastName: "Doe",
  email: "jane.doe@example.org",
  createdAt: "12 March 2024",
  contactPreference: "Critical only",
  mfaEnabled: false,
  githubConnected: false,
};

/** The OpenFn instance the current user is signed in to (named after the team that runs it). */
export const currentInstance = {
  name: "Sim DTU",
  initials: "SD",
};

export const userCredentials: UserCredential[] = [
  {
    id: "ucred-dhis2-play",
    name: "DHIS2 Play (personal)",
    type: "DHIS2",
    projects: ["Project A"],
    production: false,
    createdAt: "2 Apr 2024",
  },
  {
    id: "ucred-commcare",
    name: "CommCare test account",
    type: "CommCare",
    projects: ["Project B"],
    production: false,
    createdAt: "18 Jun 2024",
  },
  {
    id: "ucred-sheets",
    name: "Google Sheets reporting",
    type: "Google Sheets",
    projects: ["Project A", "Project B"],
    production: true,
    createdAt: "9 Jan 2025",
  },
];

export const userOAuthClients: OAuthClient[] = [
  { id: "oauth-google", name: "Google Workspace", system: "Google Sheets", scope: "Global" },
  { id: "oauth-salesforce", name: "Salesforce sandbox app", system: "Salesforce", scope: "Project" },
];

export const userApiTokens: ApiToken[] = [
  { id: "tok-1", suffix: "a91f", createdAt: "4 Feb 2025", lastUsedAt: "8 Oct 2026" },
  { id: "tok-2", suffix: "07cc", createdAt: "21 Aug 2025" },
];

export const userSettingsData: UserSettingsPageData = {
  pageType: "user-settings",
  profile: currentUser,
  credentials: userCredentials,
  oauthClients: userOAuthClients,
  apiTokens: userApiTokens,
};
