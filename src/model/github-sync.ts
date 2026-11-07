/** The repositories a GitHub App installation can reach. */
export interface GitHubInstallation {
  id: string;
  /** The user or organisation it's installed on. */
  account: string;
  repos: GitHubRepo[];
}

/** A repository an installation can reach. */
export interface GitHubRepo {
  /** "owner/name". */
  fullName: string;
  /** Where the pull workflow is committed. */
  defaultBranch: string;
  branches: string[];
}

/** How the project is connected to a GitHub branch. */
export interface GitHubConnectionSettings {
  installationId: string;
  /** "owner/name". */
  repo: string;
  branch: string;
  /** Where the project's config lives in the repo; blank for the default. */
  configPath: string;
  /** Which way the first sync went. */
  syncDirection: SyncDirection;
}

/** The project's GitHub connection, once it's made. */
export interface GitHubConnection extends GitHubConnectionSettings {
  /** When the last sync ran, for display; absent before the first. */
  lastSyncedAt?: string;
}

/** The project's GitHub sync, connected or not. */
export interface GitHubSyncState {
  /** Your OpenFn account is linked to GitHub, so you can pick installations. */
  accountConnected: boolean;
  /** The installations your GitHub account can use. */
  installations: GitHubInstallation[];
  /** The project's connection, absent when it isn't synced. */
  connection?: GitHubConnection;
}

/**
 * The direction of the first sync, in Lightning's terms: `pull` exports this
 * project to GitHub; `deploy` imports what's on GitHub over this project.
 */
export type SyncDirection = "pull" | "deploy";
