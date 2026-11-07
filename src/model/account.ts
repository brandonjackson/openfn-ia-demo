/**
 * You, as /api/me and its routes have it (api/account.md): your profile, your
 * multi-factor authentication and your API tokens, and the rules their forms
 * check before they're sent. They mirror Lightning's changesets; the server
 * still has the last word (an email already taken, a code that's wrong).
 */

/** How often OpenFn may get in touch about your account. */
export type ContactPreference = "Anytime" | "Critical only";

export const CONTACT_PREFERENCES: ContactPreference[] = ["Anytime", "Critical only"];

export interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  /** When the account was made, e.g. "12 March 2024". */
  createdAt: string;
  contactPreference: ContactPreference;
  /** Whether signing in asks for a code from an authenticator app. */
  mfaEnabled: boolean;
  /** Whether the account is linked to GitHub, for version control. */
  githubConnected: boolean;
  /** A new address waiting for its confirmation link to be clicked. Absent when no change is pending. */
  pendingEmail?: string;
  /** When the account will be deleted, once you've asked for it, e.g. "12 Nov 2026". Absent otherwise. */
  scheduledDeletion?: string;
}

/** A name, first and last, and how often to get in touch: what Profile's first form saves. */
export type ProfileDetails = Pick<UserProfile, "firstName" | "lastName" | "contactPreference">;

/** The secret for a new authenticator app, while setting up multi-factor authentication. */
export interface MfaSetup {
  /** The key to type into the app by hand, in base32. */
  secret: string;
  /** The otpauth:// link the QR code stands for. */
  uri: string;
}

/** A one-time code for signing in without the authenticator app. */
export interface BackupCode {
  code: string;
  /** When it was used, e.g. "3 Oct 2026". Absent while it's still good. */
  usedAt?: string;
}

export interface ApiToken {
  id: string;
  /** Last characters of the token; the rest is masked in the UI. */
  suffix: string;
  createdAt: string;
  lastUsedAt?: string;
}

/** Shortest and longest password Lightning accepts. */
export const PASSWORD_MIN = 12;
export const PASSWORD_MAX = 72;

/** What's wrong with a new password and its confirmation, field by field. */
export function passwordErrors(password: string, confirmation: string): { password?: string; confirmation?: string } {
  const errors: { password?: string; confirmation?: string } = {};
  if (!password) errors.password = "can't be blank";
  else if (password.length < PASSWORD_MIN) errors.password = `should be at least ${PASSWORD_MIN} characters`;
  else if (password.length > PASSWORD_MAX) errors.password = `should be at most ${PASSWORD_MAX} characters`;
  if (confirmation !== password) errors.confirmation = "does not match password";
  return errors;
}

/** A one-time code from an authenticator app: six digits. */
export function isTotpCode(code: string): boolean {
  return /^\d{6}$/.test(code.trim());
}

/** The instance, as GET /api/instance describes it. */
export interface InstanceInfo {
  /** What the instance is called, for the logo and the account menu: the demo's own field, or the URL's host where there's none (docs/api-gaps.md). */
  name: string;
  /** The instance's own base URL: a sign-on provider's redirect host. */
  url: string;
  /** Days a scheduled deletion waits before it happens (`purge_deleted_after_days`). */
  deletionGraceDays: number;
  /** Whether it sends OpenFn anonymous usage metrics. The demo's own field (docs/api-gaps.md). */
  usageMetricsEnabled: boolean;
}

/**
 * What to call the instance. Lightning sends no name (docs/api-gaps.md), so
 * one without it goes by its URL's host ("demo.openfn.org").
 */
export function instanceName(name: string | undefined, url: string): string {
  if (name) return name;
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
}

/**
 * The letters on the instance's tile: the first letter of each of its first
 * two words ("Sim DTU" → "SD"), or the first two of a one-word name or a
 * host's first part ("demo.openfn.org" → "DE").
 */
export function instanceInitials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length > 1) return (words[0]![0]! + words[1]![0]!).toUpperCase();
  return (words[0] ?? "").split(".")[0]!.slice(0, 2).toUpperCase();
}
