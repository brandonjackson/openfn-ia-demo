/**
 * Users on the pretend server (api/users.md). One table for everyone on the
 * instance, seeded from the admin fixtures, which every other part of the
 * demo now reads through the API: project members, credential owners, the
 * audit trail's actors.
 */
import { instanceUsers } from "../fixtures/admin";
import { currentUser } from "../fixtures/user";
import { ORIGIN } from "./answers";
import { seedTime, table } from "./db";
import { seedId } from "../fixtures/ids";

export interface UserRow {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: "user" | "superuser";
  /** Planned: can open projects that allow support access. */
  support_user: boolean;
  /** Planned: can't sign in. */
  disabled: boolean;
  /** Planned: when the account will be removed, or null. */
  scheduled_deletion: string | null;
  /** Planned: has created runs, which keeps them from being removed. */
  has_activity_in_projects: boolean;
  last_login_at: string | null;
  mfa_enabled: boolean;
  /** Planned, set by the person: which emails they get. */
  contact_preference: "critical" | "any";
  /** A new address waiting for its confirmation link. */
  pending_email: string | null;
  /** Whether they've linked a GitHub account. */
  github_connected: boolean;
  inserted_at: string;
}

/** A fixture user's id on the fake server, from their fixture id ("user-jane"). */
export const userIdFor = (fixtureId: string) => seedId("user", fixtureId);

export const users = table<UserRow>("users", () =>
  instanceUsers.map((u) => ({
    id: userIdFor(u.id),
    email: u.email,
    first_name: u.firstName,
    last_name: u.lastName,
    role: u.role,
    support_user: u.supportUser,
    disabled: u.disabled,
    scheduled_deletion: u.scheduledDeletion ? seedTime(u.scheduledDeletion) : null,
    has_activity_in_projects: u.hasActivity,
    last_login_at: u.lastLogin ? seedTime(u.lastLogin) : null,
    mfa_enabled: u.email === currentUser.email ? currentUser.mfaEnabled : false,
    contact_preference: u.email === currentUser.email && currentUser.contactPreference === "Anytime" ? "any" : "critical",
    pending_email: null,
    github_connected: u.email === currentUser.email ? currentUser.githubConnected : false,
    inserted_at: u.email === currentUser.email ? seedTime(currentUser.createdAt) : seedTime("1 Mar 2024"),
  })),
);

export const findUser = (id: string) => users.rows().find((u) => u.id === id);
export const findUserByEmail = (email: string) => users.rows().find((u) => u.email.toLowerCase() === email.toLowerCase());

/** "Ada Lovelace". */
export const fullName = (u: Pick<UserRow, "first_name" | "last_name">) => `${u.first_name} ${u.last_name}`.trim();

/** A user as GET /api/users/:id answers it, planned attributes included. */
export const userEntry = (u: UserRow) => ({
  type: "users",
  id: u.id,
  attributes: {
    email: u.email,
    first_name: u.first_name,
    last_name: u.last_name,
    role: u.role,
    support_user: u.support_user,
    disabled: u.disabled,
    scheduled_deletion: u.scheduled_deletion,
    has_activity_in_projects: u.has_activity_in_projects,
    last_login_at: u.last_login_at,
  },
  links: { self: `${ORIGIN}/api/users/${u.id}` },
});
