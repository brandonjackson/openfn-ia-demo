/*
 * The vocabulary and rules of a project's settings, as Lightning has them:
 * roles and who may do what, collection and project names, webhook auth
 * methods, alert digests and GitHub sync directions. Pure functions over the
 * values passed in, so a wrapper on any data source decides the same way.
 */

/* ------------------------------------------------------------------ */
/*  Roles                                                              */
/* ------------------------------------------------------------------ */

/** A collaborator's role in a project, from most to least powerful. */
export type ProjectRole = "owner" | "admin" | "editor" | "viewer";

export const projectRoleLabels: Record<ProjectRole, string> = {
  owner: "Owner",
  admin: "Admin",
  editor: "Editor",
  viewer: "Viewer",
};

/** Roles a new collaborator can be given. Nobody joins as owner. */
export const addableRoles: ProjectRole[] = ["viewer", "editor", "admin"];

const rank: Record<ProjectRole, number> = { owner: 3, admin: 2, editor: 1, viewer: 0 };

/** True when `role` is `least` or above. */
export function hasRole(role: ProjectRole, least: ProjectRole): boolean {
  return rank[role] >= rank[least];
}

/**
 * What a role lets you do in project settings, after Lightning's policies:
 * owners and admins manage the project, its people, webhook security,
 * collections, data retention and GitHub; editors can start a GitHub sync;
 * only an owner can delete the project.
 */
export interface ProjectSettingsPermissions {
  /** Change the project's name, description, environment, concurrency and MFA rule. */
  canEditProject: boolean;
  /** Delete the whole project. */
  canDeleteProject: boolean;
  /** Add, invite and remove collaborators, and change their roles. */
  canManageCollaborators: boolean;
  /** Create, edit and delete webhook auth methods. */
  canWriteWebhookAuth: boolean;
  /** Create, rename and delete collections. */
  canManageCollections: boolean;
  /** Change how long history and input/output data are kept. */
  canEditDataRetention: boolean;
  /** Connect, change and remove the GitHub repository. */
  canConfigureGitHub: boolean;
  /** Start a sync to the connected branch. */
  canInitiateSync: boolean;
}

export function permissionsFor(role: ProjectRole): ProjectSettingsPermissions {
  const admin = hasRole(role, "admin");
  return {
    canEditProject: admin,
    canDeleteProject: role === "owner",
    canManageCollaborators: admin,
    canWriteWebhookAuth: admin,
    canManageCollections: admin,
    canEditDataRetention: admin,
    canConfigureGitHub: admin,
    canInitiateSync: hasRole(role, "editor"),
  };
}

/** Who you are and who you're looking at, for the collaborator rules below. */
interface Member {
  role: ProjectRole;
  isSelf: boolean;
}

/**
 * The roles you can give a collaborator; empty when you can't change theirs.
 * Owners and admins change other people's roles, never their own. A project
 * has exactly one owner and ownership can't be handed over (the API's
 * `one_owner` rule), so the owner's role never changes and no one else can
 * be made owner.
 */
export function assignableRoles(you: ProjectRole, them: Member): ProjectRole[] {
  if (!hasRole(you, "admin") || them.isSelf || them.role === "owner") return [];
  return addableRoles;
}

/**
 * Why you can't remove a collaborator, in Lightning's words, or `undefined`
 * when you can.
 */
export function removeBlockedReason(you: ProjectRole, them: Member): string | undefined {
  if (!hasRole(you, "admin")) return "You do not have permission to remove a user";
  if (them.isSelf) return "You cannot remove yourself";
  if (them.role === "owner") return "You cannot remove an owner";
  return undefined;
}

/* ------------------------------------------------------------------ */
/*  Alerts                                                             */
/* ------------------------------------------------------------------ */

/** How often a collaborator gets a digest of the project's runs. */
export type DigestFrequency = "never" | "daily" | "weekly" | "monthly";

export const digestLabels: Record<DigestFrequency, string> = {
  never: "Never",
  daily: "Daily",
  weekly: "Weekly",
  monthly: "Monthly",
};

/* ------------------------------------------------------------------ */
/*  Names and emails                                                   */
/* ------------------------------------------------------------------ */

/**
 * A name made safe for a URL, the way Lightning derives a project's or a
 * collection's name from what was typed: lowercase, with anything but letters,
 * digits, `_`, `.` and `-` turned into dashes.
 */
export function urlSafeName(raw: string): string {
  return raw
    .toLowerCase()
    .replace(/[^\p{L}0-9_.-]+/gu, "-")
    .replace(/^-+|-+$/g, "");
}

const collectionNamePattern = /^[a-z0-9]+([-_.][a-z0-9]+)*$/;

/**
 * What's wrong with a collection name, or `undefined` if it's fine. `taken`
 * is the project's other collection names.
 */
export function collectionNameError(name: string, taken: string[]): string | undefined {
  if (!name) return "can't be blank";
  if (!collectionNamePattern.test(name)) return "Collection name must be URL safe";
  if (taken.includes(name)) return "A collection with this name already exists";
  return undefined;
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

/* ------------------------------------------------------------------ */
/*  Webhook auth methods                                               */
/* ------------------------------------------------------------------ */

/** Basic HTTP auth (a username and password) or an API key in the `x-api-key` header. */
export type WebhookAuthType = "basic" | "api";

export const webhookAuthTypes: Record<WebhookAuthType, { label: string; description: string }> = {
  basic: { label: "Basic", description: "Basic HTTP authentication (username and password)" },
  api: { label: "API key", description: "API key authentication (‘x-api-key’ header)" },
};

/** A webhook username as Lightning stores it: lowercase, with dashes for spaces. */
export function webhookUsername(raw: string): string {
  return raw.toLowerCase().replace(/ /g, "-");
}

/** What's wrong with a new basic auth password, or `undefined`. */
export function webhookPasswordError(password: string): string | undefined {
  if (!password) return "can't be blank";
  if (password.length < 8) return "should be at least 8 characters";
  if (password.length > 72) return "should be at most 72 characters";
  return undefined;
}

/** What's wrong with an auth method's name, or `undefined`. `taken` is the project's other names. */
export function webhookAuthNameError(name: string, taken: string[]): string | undefined {
  if (!name.trim()) return "can't be blank";
  if (taken.includes(name.trim())) return "must be unique within the project";
  return undefined;
}

/** "1 trigger", "3 triggers". */
export function countLabel(count: number, noun: string): string {
  return `${count} ${noun}${count === 1 ? "" : "s"}`;
}

/** A secret with all but its last five characters hidden, as Lightning masks an API key. */
export function maskSecret(value: string): string {
  return "•".repeat(Math.min(15, Math.max(0, value.length - 5))) + value.slice(-5);
}

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

/** A byte count in the largest unit that keeps it above 1: "512 B", "2.4 kB", "1.1 MB". */
export function formatBytes(bytes: number): string {
  const units = ["B", "kB", "MB", "GB"];
  let value = bytes;
  let unit = 0;
  while (value >= 1000 && unit < units.length - 1) {
    value /= 1000;
    unit += 1;
  }
  return `${unit === 0 ? value : value.toFixed(1)} ${units[unit]}`;
}

/** The history and input/output retention periods a project can choose from. */
export const retentionPeriods = ["7 Days", "14 Days", "30 Days", "90 Days", "180 Days", "1 Year"];

/** A retention period's days, as the API sends them: "30 Days" → 30, "1 Year" → 365. */
export function retentionDays(label: string): number {
  const n = Number.parseInt(label, 10);
  return /year/i.test(label) ? n * 365 : n;
}

/**
 * A number of days as one of `retentionPeriods`. No period (keep everything,
 * a new project's default) shows as the longest there is.
 */
export function retentionLabel(days: number | null): string {
  if (days === null) return retentionPeriods[retentionPeriods.length - 1]!;
  return retentionPeriods.find((p) => retentionDays(p) === days) ?? `${days} Days`;
}

/** Keep input/output data for every run, or never store it. */
export type IoDataPolicy = "retain" | "zero-persistence";

/** Where a history export is in its life. */
export type HistoryExportStatus = "enqueued" | "processing" | "completed" | "failed";

/* ------------------------------------------------------------------ */
/*  GitHub sync                                                        */
/* ------------------------------------------------------------------ */

/**
 * The direction of the first sync, in Lightning's terms: `pull` exports this
 * project to GitHub; `deploy` imports what's on GitHub over this project.
 */
export type SyncDirection = "pull" | "deploy";

export const syncDirections: Record<SyncDirection, { label: string; description: string }> = {
  pull: {
    label: "OpenFn → GitHub: Export to GitHub",
    description:
      "Commit a copy of your current OpenFn project to GitHub. This does not affect any workflows or configuration here.",
  },
  deploy: {
    label: "GitHub → OpenFn: Import from GitHub (overwrite this project)",
    description:
      "Replace this OpenFn project with the workflows, collections and channels that are already committed to GitHub.",
  },
};

/** The files the first sync commits, each with the branch it goes to. */
export function syncCommitFiles(
  projectId: string,
  branch: string,
  defaultBranch: string,
  configPath: string
): { path: string; branch: string }[] {
  const files = [
    { path: ".github/workflows/openfn-pull.yml", branch: defaultBranch },
    { path: `.github/workflows/openfn-${projectId}-deploy.yml`, branch },
  ];
  if (!configPath.trim()) files.push({ path: `openfn-${projectId}-config.json`, branch });
  return files;
}
