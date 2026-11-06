/*
 * Credentials and OAuth clients as api/credentials.md has them, and the rules
 * their forms check before they're sent: pure functions over the values
 * typed, mirroring Lightning's changesets. The server still has the last
 * word, and its answer comes back as a rejected promise.
 */

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

/** What kind of value a credential field takes, which decides its input. */
export type CredentialFieldKind = "text" | "url" | "secret" | "number" | "boolean" | "json";

/** One value a credential type asks for, from its adaptor's configuration schema. */
export interface CredentialField {
  /** Its key in the credential body, e.g. "hostUrl". */
  key: string;
  label: string;
  kind: CredentialFieldKind;
  /** One line on what to put in it. */
  description?: string;
  /** An example value shown in the empty input. */
  placeholder?: string;
  /** Whether the credential can't be saved without it. */
  required?: boolean;
  /** The value a new credential starts with, e.g. "5432" for a port. */
  defaultValue?: string;
}

/**
 * A kind of credential you can make, as the schema list names it: enough for
 * the type picker and the credentials table. Its fields come with the full
 * `CredentialSchema`, fetched once it's picked.
 */
export interface CredentialSchemaSummary {
  /** The schema's id, e.g. "dhis2" or "raw". */
  id: string;
  /** What it's called in the type picker, e.g. "DHIS2". */
  name: string;
  /** Adaptor id for its logo; absent for raw JSON. */
  adaptor?: string;
}

/** A kind of credential in full: an adaptor's configuration schema, or raw JSON. */
export interface CredentialSchema extends CredentialSchemaSummary {
  /** One line on what it connects to. */
  description: string;
  /** What it asks for, in order. Raw JSON has one `json` field, `body`. */
  fields: CredentialField[];
}

/**
 * Raw JSON: a credential whose body can be anything, for adaptors without a
 * schema. The API names it `raw` and sends no schema for it, so its one
 * field is fixed here.
 */
export const rawCredentialSchema: CredentialSchema = {
  id: "raw",
  name: "Raw JSON",
  description: "Any body at all, for adaptors without a schema",
  fields: [{ key: "body", label: "Credential body", kind: "json", required: true, defaultValue: "{}" }],
};

/**
 * A credential's values for one environment. Secret fields never come back
 * from the server: they're missing here even when they're set, and a blank
 * secret on save keeps the one already stored. Booleans are "true" or "false";
 * raw JSON is the whole body as text under `body`.
 */
export interface CredentialEnvironmentValues {
  environment: Environment;
  values: Record<string, string>;
}

export interface UserCredential {
  id: string;
  name: string;
  /** Id of its `CredentialSchema`. */
  schema: string;
  /** An optional id it's known by in an outside system. */
  externalId?: string;
  /** Ids of the projects that can use it. */
  projectIds: string[];
  /** Its values per environment, at least one. A sandbox uses the environment its project names. */
  environments: CredentialEnvironmentValues[];
  createdAt: string;
  /** Email of the person it's being handed to, while they haven't accepted yet. */
  transferPendingTo?: string;
}

/** A credential as the form saves it: no `id` for a new one, and secrets in the values. */
export type CredentialDraft = Omit<UserCredential, "id" | "createdAt" | "transferPendingTo"> & { id?: string };

export interface OAuthClient {
  id: string;
  name: string;
  /** Where people are sent to sign in and grant access. */
  authorizationEndpoint: string;
  /** Where OpenFn swaps the grant for tokens. */
  tokenEndpoint: string;
  /** Where OpenFn revokes a token it no longer needs. */
  revocationEndpoint?: string;
  /** Where OpenFn checks whether a token is still good. */
  introspectionEndpoint?: string;
  /** Where OpenFn reads who signed in. */
  userinfoEndpoint?: string;
  /** The app's id at the provider. The client secret never comes back from the server. */
  clientId: string;
  /** Scopes every credential made with this client asks for. */
  mandatoryScopes: string[];
  /** Scopes a credential may add. */
  optionalScopes: string[];
  /** Where the provider documents its scopes. */
  scopesDocUrl?: string;
  /** Any project on the instance can use it. Only superusers make global clients. */
  global: boolean;
  /** Ids of the projects that can use it, when it isn't global. */
  projectIds: string[];
}

/** An OAuth client as the form saves it: no `id` for a new one, and a secret when one is typed. */
export type OAuthClientDraft = Omit<OAuthClient, "id"> & { id?: string; clientSecret?: string };

/** A project you could share a credential or OAuth client with. */
export interface ProjectOption {
  id: string;
  name: string;
}
