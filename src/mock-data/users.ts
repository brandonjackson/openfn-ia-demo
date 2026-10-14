/**
 * Users, modelled on Lightning's demo seed (lib/lightning/setup_utils.ex).
 * Static fixtures only: nothing here talks to a backend.
 */

export type UserRole = "superuser" | "user";

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  /** ISO date the account was confirmed; null means unconfirmed. */
  confirmedAt: string | null;
  insertedAt: string;
  mfaEnabled: boolean;
  githubConnected: boolean;
  experimentalFeatures: boolean;
  /** Superusers can disable an account; disabled users can't log in. */
  disabled: boolean;
  /** Pending deletion date, if the account is scheduled for deletion. */
  scheduledDeletion: string | null;
  contactPreference: "critical" | "any";
}

export const users: User[] = [
  {
    id: "user-amy",
    firstName: "Amy",
    lastName: "Admin",
    email: "demo@openfn.org",
    role: "superuser",
    confirmedAt: "2024-03-12",
    insertedAt: "2024-03-12",
    mfaEnabled: false,
    githubConnected: false,
    experimentalFeatures: false,
    disabled: false,
    scheduledDeletion: null,
    contactPreference: "critical",
  },
  {
    id: "user-esther",
    firstName: "Esther",
    lastName: "Editor",
    email: "editor@openfn.org",
    role: "user",
    confirmedAt: "2024-03-14",
    insertedAt: "2024-03-14",
    mfaEnabled: true,
    githubConnected: true,
    experimentalFeatures: false,
    disabled: false,
    scheduledDeletion: null,
    contactPreference: "any",
  },
  {
    id: "user-vikram",
    firstName: "Vikram",
    lastName: "Viewer",
    email: "viewer@openfn.org",
    role: "user",
    confirmedAt: null,
    insertedAt: "2024-05-02",
    mfaEnabled: false,
    githubConnected: false,
    experimentalFeatures: false,
    disabled: false,
    scheduledDeletion: null,
    contactPreference: "critical",
  },
  {
    id: "user-sizwe",
    firstName: "Sizwe",
    lastName: "Super",
    email: "super@openfn.org",
    role: "superuser",
    confirmedAt: "2024-01-08",
    insertedAt: "2024-01-08",
    mfaEnabled: true,
    githubConnected: false,
    experimentalFeatures: true,
    disabled: false,
    scheduledDeletion: null,
    contactPreference: "critical",
  },
];

/** The signed-in user. A superuser, so the Admin menu is reachable. */
export const currentUser: User = users[0];

/** Address the sidebar's "Support" link mails (Lightning.Config.instance_admin_email). */
export const instanceAdminEmail = "support@openfn.org";

/** Release label shown in the sidebar footer's version chip. */
export const releaseLabel = "v2.19.1";

export function fullName(user: Pick<User, "firstName" | "lastName">): string {
  return [user.firstName, user.lastName].filter(Boolean).join(" ");
}

export function findUser(id: string): User | undefined {
  return users.find((u) => u.id === id);
}
