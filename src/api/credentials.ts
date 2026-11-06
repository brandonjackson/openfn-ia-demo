/**
 * Credentials and OAuth clients on Lightning's API (api/credentials.md): the
 * API's shapes, the mappers onto the forms' types, the keys and the hooks.
 * A credential's secrets are sent, never read back.
 */
import { useCallback } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ProjectCredential } from "../model/adaptor-reference";
import { rawCredentialSchema, type CredentialDraft, type CredentialField, type CredentialFieldKind, type CredentialSchema, type CredentialSchemaSummary, type OAuthClient, type UserCredential, type Environment } from "../model/credentials";
import { formatDate } from "../model/time";
import { listAll, request } from "./client";
import { statusOf, type LoadStatus } from "./status";
import { workflowKeys } from "./workflows";

/** A credential as the API sends it, planned fields included. */
interface ApiCredential {
  id: string;
  name: string;
  schema: string;
  external_id: string | null;
  project_credentials: { id: string; project_id: string }[];
  projects: { id: string; name: string }[];
  owner: { id: string; email: string; first_name: string; last_name: string } | null;
  environments: { name: string }[];
  transfer_status: "pending" | "completed" | null;
  transfer_recipient?: string | null;
  inserted_at: string;
}

/** An OAuth client as the API sends it: never its secret. */
interface ApiOAuthClient {
  id: string;
  name: string;
  client_id: string;
  authorization_endpoint: string;
  token_endpoint: string;
  revocation_endpoint: string | null;
  userinfo_endpoint: string | null;
  introspection_endpoint: string | null;
  scopes_doc_url: string | null;
  mandatory_scopes: string;
  optional_scopes: string;
  global: boolean;
  project_ids: string[];
}

const scopes = (text: string) => text.split(",").map((s) => s.trim()).filter(Boolean);

const toOAuthClient = (o: ApiOAuthClient): OAuthClient => ({
  id: o.id,
  name: o.name,
  authorizationEndpoint: o.authorization_endpoint,
  tokenEndpoint: o.token_endpoint,
  ...(o.revocation_endpoint && { revocationEndpoint: o.revocation_endpoint }),
  ...(o.introspection_endpoint && { introspectionEndpoint: o.introspection_endpoint }),
  ...(o.userinfo_endpoint && { userinfoEndpoint: o.userinfo_endpoint }),
  clientId: o.client_id,
  mandatoryScopes: scopes(o.mandatory_scopes),
  optionalScopes: scopes(o.optional_scopes),
  ...(o.scopes_doc_url && { scopesDocUrl: o.scopes_doc_url }),
  global: o.global,
  projectIds: o.project_ids,
});

/** A credential schema as GET /api/credential_schemas/:name sends it. `raw` has no `schema`. */
export interface ApiCredentialSchema {
  name: string;
  title: string;
  schema?: {
    description?: string;
    properties?: Record<string, ApiSchemaProperty>;
    required?: string[];
  };
}

/** One property of an adaptor's configuration schema (JSON Schema). */
interface ApiSchemaProperty {
  type?: string;
  title?: string;
  description?: string;
  format?: string;
  writeOnly?: boolean;
  examples?: unknown[];
  default?: unknown;
}

function fieldKind(p: ApiSchemaProperty): CredentialFieldKind {
  if (p.writeOnly) return "secret";
  if (p.format === "uri") return "url";
  if (p.type === "number" || p.type === "integer") return "number";
  if (p.type === "boolean") return "boolean";
  if (p.type === "object" || p.type === "array") return "json";
  return "text";
}

/** The short name the forms know a schema by: `@openfn/language-dhis2` is `dhis2`. Lightning stores names in full. */
export const schemaIdOf = (name: string) => name.replace(/^@openfn\/language-/, "");

/** A schema value as the form's text: strings as they are, anything else as JSON. */
const asText = (v: unknown) => (typeof v === "string" ? v : JSON.stringify(v));

/**
 * A schema's fields in the order its properties come, under the short name
 * the forms use (`dhis2`). `raw`, and an adaptor whose schema has no
 * properties, take any JSON body.
 */
export function toCredentialSchema({ name, title, schema }: ApiCredentialSchema): CredentialSchema {
  const id = schemaIdOf(name);
  if (name === "raw") return { ...rawCredentialSchema, name: title };
  if (!schema?.properties || Object.keys(schema.properties).length === 0)
    return { ...rawCredentialSchema, id, name: title, adaptor: id, description: schema?.description ?? "" };
  const required = new Set(schema.required ?? []);
  const fields: CredentialField[] = Object.entries(schema.properties).map(([key, p]) => ({
    key,
    label: p.title ?? key,
    kind: fieldKind(p),
    ...(p.description && { description: p.description }),
    ...(p.examples?.[0] !== undefined && { placeholder: asText(p.examples[0]) }),
    ...(required.has(key) && { required: true }),
    ...(p.default !== undefined && { defaultValue: asText(p.default) }),
  }));
  return { id, name: title, adaptor: id, description: schema.description ?? "", fields };
}

/** A schema as the list names it: `raw` keeps its id, an adaptor's goes by its short name. */
const toCredentialSchemaSummary = ({ name, title }: { name: string; title: string }): CredentialSchemaSummary =>
  name === "raw" ? { id: "raw", name: title } : { id: schemaIdOf(name), name: title, adaptor: schemaIdOf(name) };

export const credentialKeys = {
  all: ["credentials"] as const,
  mine: ["credentials", "mine"] as const,
  inProject: (projectId: string) => ["credentials", "project", projectId] as const,
  oauthClients: ["oauth_clients"] as const,
  schemas: ["credential_schemas"] as const,
  schema: (id: string) => ["credential_schemas", id] as const,
};

/**
 * Every kind of credential you can make, in the API's order, by name only:
 * a schema's fields are fetched once it's picked (`useCredentialSchemaLoader`).
 */
export function useCredentialSchemas(): { status: LoadStatus; schemas: CredentialSchemaSummary[] } {
  const query = useQuery({
    queryKey: credentialKeys.schemas,
    queryFn: async () => (await request<{ data: { name: string; title: string }[] }>("GET", "/api/credential_schemas")).data,
    select: (rows) => rows.map(toCredentialSchemaSummary),
    // Schemas change only when adaptors do.
    staleTime: Infinity,
  });
  return { status: statusOf(query), schemas: query.data ?? [] };
}

/**
 * Fetches one kind of credential in full, with the fields it asks for, by
 * the short name the forms know it by (`dhis2`). Each is asked for once and
 * kept; a refusal rejects with the server's message.
 */
export function useCredentialSchemaLoader(): (id: string) => Promise<CredentialSchema> {
  const queryClient = useQueryClient();
  // Stable, so a form that fetches as it opens doesn't fetch again on every render.
  return useCallback(
    (id: string) =>
      queryClient
        .fetchQuery({
          queryKey: credentialKeys.schema(id),
          queryFn: async () => (await request<{ data: ApiCredentialSchema }>("GET", `/api/credential_schemas/${encodeURIComponent(id)}`)).data,
          // Kept for the session: nothing watches a fetched query, so it would otherwise be dropped after five minutes.
          staleTime: Infinity,
          gcTime: Infinity,
        })
        .then(toCredentialSchema),
    [queryClient],
  );
}

/**
 * Your credentials, each with its environments and their values that
 * aren't secret (so the form can show them; secrets come back blank).
 * `rootProjects` keeps a credential's projects to the ones it was shared
 * with, not the sandboxes its links reach as well.
 */
export function useMyCredentials(rootProjects: string[]): { status: LoadStatus; credentials: UserCredential[] } {
  const query = useQuery({
    queryKey: credentialKeys.mine,
    queryFn: async () => {
      const list = await listAll<ApiCredential>("/api/credentials", "credentials");
      const envs = await Promise.all(
        list.map((c) => request<{ data: { name: string; values: Record<string, string> }[] }>("GET", `/api/credentials/${c.id}/environments`).then((a) => a.data)),
      );
      return list.map((c, i) => ({ c, envs: envs[i]! }));
    },
  });
  const credentials = (query.data ?? []).map(
    ({ c, envs }): UserCredential => ({
      id: c.id,
      name: c.name,
      schema: schemaIdOf(c.schema),
      ...(c.external_id && { externalId: c.external_id }),
      projectIds: c.projects.map((p) => p.id).filter((id) => rootProjects.includes(id)),
      environments: envs.map((e) => ({ environment: e.name as Environment, values: e.values })),
      createdAt: formatDate(c.inserted_at),
      ...(c.transfer_status === "pending" && c.transfer_recipient && { transferPendingTo: c.transfer_recipient }),
    }),
  );
  return { status: statusOf(query), credentials };
}

/**
 * The credentials a project's steps can use, as the editor offers them: one
 * per link, named by the credential, with the adaptor its schema is for.
 */
export function useProjectCredentials(projectId: string | undefined): { status: LoadStatus; credentials: ProjectCredential[] } {
  const query = useQuery({
    queryKey: credentialKeys.inProject(projectId ?? ""),
    enabled: !!projectId,
    queryFn: () => listAll<ApiCredential>(`/api/projects/${projectId}/credentials`, "credentials"),
    select: (rows) =>
      rows.flatMap((c) =>
        c.project_credentials
          .filter((l) => l.project_id === projectId)
          .map((l) => ({ id: l.id, name: c.name, adaptor: schemaIdOf(c.schema), owner: c.owner ? `${c.owner.first_name} ${c.owner.last_name}` : "Unknown" })),
      ),
  });
  return { status: projectId ? statusOf(query) : { state: "ready" }, credentials: query.data ?? [] };
}

/** Your OAuth clients and the instance's global ones. */
export function useOAuthClients(): { status: LoadStatus; clients: OAuthClient[] } {
  const query = useQuery({
    queryKey: credentialKeys.oauthClients,
    queryFn: () => listAll<ApiOAuthClient>("/api/oauth_clients"),
    select: (rows) => rows.map(toOAuthClient),
  });
  return { status: statusOf(query), clients: query.data ?? [] };
}

/**
 * Making, changing, sharing, handing over and deleting your credentials and
 * OAuth clients. Each resolves once the lists (and the editor's) have
 * reloaded, and rejects with what the server said.
 */
export function useCredentialSaves(existing: UserCredential[]) {
  const queryClient = useQueryClient();
  const refresh = () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: credentialKeys.all }),
      queryClient.invalidateQueries({ queryKey: credentialKeys.oauthClients }),
      queryClient.invalidateQueries({ queryKey: workflowKeys.all }),
    ]);
  const run = useMutation({ mutationFn: (work: () => Promise<unknown>) => work(), onSuccess: refresh });
  const go = (work: () => Promise<unknown>) => run.mutateAsync(work).then(() => undefined);

  return {
    /** Makes a credential, or brings one in line with the form: name, schema, environments and projects. */
    save: (draft: CredentialDraft) =>
      go(async () => {
        if (!draft.id) {
          await request("POST", "/api/credentials", {
            name: draft.name,
            schema: draft.schema,
            ...(draft.externalId && { external_id: draft.externalId }),
            credential_bodies: draft.environments.map((e) => ({ name: e.environment, body: e.values })),
            project_credentials: draft.projectIds.map((project_id) => ({ project_id })),
          });
          return;
        }
        const before = existing.find((c) => c.id === draft.id);
        await request("PUT", `/api/credentials/${draft.id}`, { name: draft.name, schema: draft.schema, external_id: draft.externalId ?? null });
        // Each environment's body: a blank secret keeps the stored one. Then drop the ones taken out.
        for (const e of draft.environments) await request("PUT", `/api/credentials/${draft.id}/environments/${e.environment}`, { body: e.values });
        for (const e of before?.environments ?? []) {
          if (!draft.environments.some((d) => d.environment === e.environment)) await request("DELETE", `/api/credentials/${draft.id}/environments/${e.environment}`);
        }
        for (const p of draft.projectIds) if (!before?.projectIds.includes(p)) await request("PUT", `/api/projects/${p}/credentials/${draft.id}`);
        for (const p of before?.projectIds ?? []) if (!draft.projectIds.includes(p)) await request("DELETE", `/api/projects/${p}/credentials/${draft.id}`);
      }),
    /** Deletes it at once; one runs have used can't be (`in_use`), so its deletion is scheduled instead. */
    remove: (id: string) =>
      go(() =>
        request("DELETE", `/api/credentials/${id}`).catch((e: unknown) => {
          if ((e as { code?: string }).code === "in_use") return request("PUT", `/api/credentials/${id}/scheduled_deletion`);
          throw e;
        }),
      ),
    transfer: (id: string, email: string) => go(() => request("PUT", `/api/credentials/${id}/transfer`, { recipient: email })),
    revokeTransfer: (id: string) => go(() => request("DELETE", `/api/credentials/${id}/transfer`)),
    saveOAuthClient: (draft: Omit<OAuthClient, "id"> & { id?: string; clientSecret?: string }) =>
      go(() =>
        request("PUT", `/api/oauth_clients/${draft.id ?? crypto.randomUUID()}`, {
          name: draft.name,
          client_id: draft.clientId,
          ...(draft.clientSecret && { client_secret: draft.clientSecret }),
          authorization_endpoint: draft.authorizationEndpoint,
          token_endpoint: draft.tokenEndpoint,
          revocation_endpoint: draft.revocationEndpoint ?? null,
          userinfo_endpoint: draft.userinfoEndpoint ?? null,
          introspection_endpoint: draft.introspectionEndpoint ?? null,
          scopes_doc_url: draft.scopesDocUrl ?? null,
          mandatory_scopes: draft.mandatoryScopes.join(","),
          optional_scopes: draft.optionalScopes.join(","),
          global: draft.global,
          project_ids: draft.projectIds,
        }),
      ),
    deleteOAuthClient: (id: string) => go(() => request("DELETE", `/api/oauth_clients/${id}`)),
  };
}
