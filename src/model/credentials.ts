/*
 * The rules a credential, an OAuth client or an account form checks before
 * it's sent, written as pure functions over the values typed. They mirror
 * Lightning's changesets, so the form says what the server would say; the
 * server still has the last word (an email already taken, a code that's
 * wrong), and its answer comes back as a rejected promise.
 */
import type { CredentialDraft, CredentialField, CredentialSchema } from "./page-data";

/** What each environment is called in a form. */
export const environmentLabels: Record<Environment, string> = {
  production: "Production",
  staging: "Staging",
  mock: "Mock",
};

/** Lightning's message for an address that can't be one. */
export function emailError(email: string): string | undefined {
  if (!email.trim()) return "can't be blank";
  if (!/^[^\s@]+@[^\s@]+$/.test(email.trim())) return "must have the @ sign and no spaces";
  return undefined;
}

export function isUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
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

/** Scopes typed as a list, separated by commas or spaces. */
export function parseScopes(text: string): string[] {
  return [...new Set(text.split(/[\s,]+/).map((s) => s.trim()).filter(Boolean))];
}

/**
 * What's wrong with one credential value. A blank secret is fine when one
 * is already saved for that environment, since leaving it blank keeps it.
 */
export function credentialFieldError(field: CredentialField, value: string, secretSaved: boolean): string | undefined {
  const blank = !value.trim();
  if (blank) {
    if (field.required && !(field.kind === "secret" && secretSaved)) return "can't be blank";
    return undefined;
  }
  if (field.kind === "url" && !isUrl(value)) return "must be a valid URL";
  if (field.kind === "number" && !/^\d+$/.test(value.trim())) return "must be a whole number";
  if (field.kind === "json") {
    try {
      const parsed = JSON.parse(value);
      if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) return "must be a JSON object";
    } catch {
      return "Invalid JSON format";
    }
  }
  return undefined;
}

/** Every problem with a credential draft: its name, and each field in each environment. */
export interface CredentialDraftErrors {
  name?: string;
  /** By environment, then by field key. */
  fields: Partial<Record<Environment, Record<string, string>>>;
}

/**
 * Checks a credential draft against its schema. `savedSecrets` lists the
 * environments that already had their secrets saved before this edit.
 */
export function credentialDraftErrors(
  draft: CredentialDraft,
  schema: CredentialSchema,
  savedSecrets: Environment[]
): CredentialDraftErrors {
  const errors: CredentialDraftErrors = { fields: {} };
  if (!draft.name.trim()) errors.name = "can't be blank";
  for (const env of draft.environments) {
    for (const field of schema.fields) {
      const message = credentialFieldError(field, env.values[field.key] ?? "", savedSecrets.includes(env.environment));
      if (message) errors.fields[env.environment] = { ...errors.fields[env.environment], [field.key]: message };
    }
  }
  return errors;
}

export function hasCredentialErrors(errors: CredentialDraftErrors): boolean {
  return Boolean(errors.name) || Object.keys(errors.fields).length > 0;
}

/** A credential's values with its secret fields taken out, as the server sends them back. */
export function withoutSecrets(values: Record<string, string>, schema: CredentialSchema | undefined): Record<string, string> {
  const secret = new Set(schema?.fields.filter((f) => f.kind === "secret").map((f) => f.key));
  return Object.fromEntries(Object.entries(values).filter(([key, value]) => !secret.has(key) && value !== ""));
}

/**
 * Every connected system has these three environments, and every credential
 * belongs to exactly one of them.
 * - production: the live system, real data.
 * - staging: a real instance of the system used for testing, test data.
 * - mock: a simulated stand-in (no real system behind it) for building offline.
 */
export type Environment = "production" | "staging" | "mock";

export const ENVIRONMENTS: Environment[] = ["production", "staging", "mock"];
