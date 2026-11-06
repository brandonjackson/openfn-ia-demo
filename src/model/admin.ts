import type { AdminUser, AuditEvent, AuditItemType, AuditQuery, AuthProviderDraft, InstanceRole, ProjectMembership } from "./page-data";
import type { ProjectRole } from "./project-settings";

/*
 * The vocabulary of instance administration, and the pure functions over it
 * that would be true whatever server you talk to.
 */

export const instanceRoleLabels: Record<InstanceRole, string> = {
  user: "User",
  superuser: "Superuser",
};

/** Project roles, from most to least access. */
export const projectRoles: ProjectRole[] = ["owner", "admin", "editor", "viewer"];

export const projectRoleLabels: Record<ProjectRole, string> = {
  owner: "Owner",
  admin: "Admin",
  editor: "Editor",
  viewer: "Viewer",
};

export const auditItemTypeLabels: Record<AuditItemType, string> = {
  workflow: "Workflow",
  credential: "Credential",
  project: "Project",
  user: "User",
  collection: "Collection",
  channel: "Channel",
  oauth_client: "OAuth client",
};

export function fullName(user: Pick<AdminUser, "firstName" | "lastName">): string {
  return `${user.firstName} ${user.lastName}`.trim();
}

/** What's wrong with a project's members, or undefined: every project has exactly one owner. */
export function projectOwnerError(members: ProjectMembership[]): string | undefined {
  const owners = members.filter((m) => m.role === "owner").length;
  if (owners === 0) return "Every project must have exactly one owner.";
  if (owners > 1) return "A project can have only one owner.";
  return undefined;
}

/** The name a project is saved under: lower-case words joined by dashes, as Lightning names it. */
export function projectSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Where the provider sends people back to after they log in. */
export function authRedirectUri(redirectHost: string, name: string): string {
  return `${redirectHost.replace(/\/+$/, "")}/authenticate/${name}/callback`;
}

/** What's wrong with each field of a provider draft. A field with no entry is fine. */
export function authProviderErrors(
  draft: AuthProviderDraft,
  hasStoredSecret: boolean
): Partial<Record<keyof AuthProviderDraft, string>> {
  const errors: Partial<Record<keyof AuthProviderDraft, string>> = {};
  if (!draft.name) errors.name = "Required.";
  else if (!/^[a-z0-9_-]+$/.test(draft.name))
    errors.name = "Must be lower-case and only contain letters, numbers, dashes and underscores.";
  if (!draft.discoveryUrl) errors.discoveryUrl = "Required.";
  else if (!/^https?:\/\/[^\s/]+\.[^\s/]+/.test(draft.discoveryUrl)) errors.discoveryUrl = "Must be a valid HTTP or HTTPS URL.";
  if (!draft.clientId) errors.clientId = "Required.";
  if (!draft.clientSecret && !hasStoredSecret) errors.clientSecret = "Required.";
  if (!draft.redirectHost) errors.redirectHost = "Required.";
  else if (!/^https?:\/\//.test(draft.redirectHost)) errors.redirectHost = "Must start with http:// or https://.";
  return errors;
}

/** A size in bytes as people read it: "820 B", "14.2 KB", "3.1 MB". */
export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KB", "MB", "GB", "TB"];
  let value = bytes / 1024;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit++;
  }
  return `${value < 10 ? value.toFixed(1) : Math.round(value)} ${units[unit]}`;
}

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** A day as the admin pages show it: "12 Nov 2026". */
export function formatDay(date: Date): string {
  return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
}

/** A moment as the admin pages show it: "5 Nov 2026, 09:14". */
export function formatDateTime(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${formatDay(date)}, ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

/** The day a deletion scheduled on `from` happens, `graceDays` later. */
export function deletionDay(from: Date, graceDays: number): string {
  const day = new Date(from);
  day.setDate(day.getDate() + graceDays);
  return formatDay(day);
}

/** The events that match a query's filters, in the order given. Ignores the page. */
export function filterAuditEvents(events: AuditEvent[], query: AuditQuery): AuditEvent[] {
  const search = query.search.trim().toLowerCase();
  return events.filter(
    (e) =>
      (!query.event || e.event === query.event) &&
      (!query.itemType || e.itemType === query.itemType) &&
      (!search ||
        [e.actor.label, e.actor.identifier, e.item.name, e.item.id].some((v) => v?.toLowerCase().includes(search)))
  );
}
