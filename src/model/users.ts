/** Users on the instance, as a superuser manages them (api/users.md). */

/** What someone can do across the whole instance. A superuser can reach every project and Admin settings; a user only the projects they're a member of. */
export type InstanceRole = "user" | "superuser";

/** An account on this instance, as a superuser manages it. */
export interface AdminUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  /** Their reach across the instance. */
  role: InstanceRole;
  /** Can open any project that allows support access, to help its members. */
  supportUser: boolean;
  /** A disabled user can't log in. */
  disabled: boolean;
  /** The day the account will be deleted, e.g. "12 Nov 2026". Absent unless a deletion is scheduled. */
  scheduledDeletion?: string;
  /** When they last logged in, e.g. "2 hours ago". Absent if they never have. */
  lastLogin?: string;
  /** The signed-in superuser's own account. */
  isSelf?: boolean;
  /** Whether the account can be deleted at all. Superusers and your own account can't. Decided by the server. */
  canDelete: boolean;
  /** Whether a scheduled deletion can be brought forward to now. Not while they have activity in projects. Decided by the server. */
  canDeleteNow: boolean;
}

/** What a superuser fills in to create or edit a user. */
export interface AdminUserDraft {
  firstName: string;
  lastName: string;
  email: string;
  role: InstanceRole;
  supportUser: boolean;
  disabled: boolean;
  /** Only when creating a user: the password they first log in with. Never sent back. */
  password?: string;
}
