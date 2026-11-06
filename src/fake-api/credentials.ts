/**
 * Credentials and OAuth clients on the pretend server (api/credentials.md).
 *
 * Lifecycle, as the API has it:
 * - A credential belongs to one person, its owner; its name is unique among
 *   theirs. It holds a body per environment (1 to 5), which no answer ever
 *   carries back.
 * - It reaches projects through links (`project_credentials`), and a step
 *   points at the link, not the credential. Linking needs the owner to be a
 *   member of the project, and links its sandboxes too. Unlinking takes it
 *   off the project's steps; sandbox links stay. A member who leaves a
 *   project takes their credentials' links with them.
 * - `external_id` is unique among the credentials linked to one project.
 * - `DELETE` deletes at once, unless runs have used it (409 `in_use`).
 * - A transfer asks the new owner to accept; they must be in every project
 *   it's linked to.
 * - OAuth clients: yours and the global ones; a global one needs a superuser.
 *   Its secret never comes back.
 */
import { projectCredentials as fixtureProjectCredentials } from "../fixtures/adaptor-reference";
import { userCredentials, userOAuthClients } from "../fixtures/user";
import { newId, seedId } from "../fixtures/ids";
import { withoutSecrets } from "../model/credentials";
import { badId, conflict, forbidden, invalid, isUuid, json, noContent, notFound, now, paged, unknownKeys, type Body, type Entry, type Handler } from "./answers";
import { record } from "./audit";
import { findSchema, fullSchemaName } from "./credential-schemas";
import { seedTime, table } from "./db";
import { findProject, fixtureSandboxes, guardProject, members, onMemberRemoved, projectIdFor, projects, roleIn, type ProjectRow } from "./projects";
import { currentUserId } from "./session";
import { findUser, findUserByEmail, userIdFor } from "./users";
import { setCredentialCheck, workflows } from "./workflows";

export interface CredentialRow {
  id: string;
  user_id: string;
  name: string;
  schema: string;
  external_id: string | null;
  environments: { name: string; body: Record<string, string>; inserted_at: string; updated_at: string }[];
  scheduled_deletion: string | null;
  /** Planned: whose acceptance a transfer is waiting for. */
  transfer_to: string | null;
  /** Planned: runs have used it, which keeps it from being deleted. */
  has_activity_in_projects: boolean;
  inserted_at: string;
  updated_at: string;
}

export interface ProjectCredentialRow {
  id: string;
  project_id: string;
  credential_id: string;
  inserted_at: string;
}

export interface OAuthClientRow {
  id: string;
  user_id: string;
  name: string;
  client_id: string;
  client_secret: string;
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
  inserted_at: string;
  updated_at: string;
}

/* ------------------------------------------------------------------ */
/*  Seed                                                               */
/* ------------------------------------------------------------------ */

// The editor's fixture credentials name owners who aren't on the instance; they go to people in its projects.
const fixtureOwner: Record<string, string> = { "Brandon Jackson": "user-amadou", "Amara Okafor": "user-john", "Jane Doe": "user-jane" };

export const credentials = table<CredentialRow>("credentials", () => [
  ...userCredentials.map((c) => ({
    id: seedId("credential", c.id),
    user_id: userIdFor("user-jane"),
    name: c.name,
    schema: fullSchemaName(c.schema),
    external_id: c.externalId ?? null,
    environments: c.environments.map((e) => ({ name: e.environment, body: e.values, inserted_at: seedTime(c.createdAt), updated_at: seedTime(c.createdAt) })),
    scheduled_deletion: null,
    transfer_to: c.transferPendingTo ? userIdFor(instanceUserId(c.transferPendingTo)) : null,
    has_activity_in_projects: false,
    inserted_at: seedTime(c.createdAt),
    updated_at: seedTime(c.createdAt),
  })),
  ...fixtureProjectCredentials.map((c) => ({
    id: seedId("credential", c.id),
    user_id: userIdFor(fixtureOwner[c.owner] ?? "user-jane"),
    name: c.name,
    // A credential's schema is its adaptor's, whether or not the form has fields for it.
    schema: fullSchemaName(c.adaptor),
    external_id: null,
    environments: [{ name: "production", body: {}, inserted_at: seedTime("1 Jun 2026"), updated_at: seedTime("1 Jun 2026") }],
    scheduled_deletion: null,
    transfer_to: null,
    has_activity_in_projects: true,
    inserted_at: seedTime("1 Jun 2026"),
    updated_at: seedTime("1 Jun 2026"),
  })),
]);

// The fixture users' ids by email, for a seed that runs before the users table has loaded.
function instanceUserId(email: string) {
  const known: Record<string, string> = { "adiallo@example.org": "user-amadou", "jane.doe@example.org": "user-jane" };
  return known[email] ?? email;
}

/** The projects a fixture credential reaches: its own list, or, for the editor's, Project A and its sandboxes. */
export const projectCredentialLinks = table<ProjectCredentialRow>("project_credentials", () => {
  const rootLinks = [
    ...userCredentials.flatMap((c) => c.projectIds.map((p) => ({ credential: seedId("credential", c.id), project: projectIdFor(p) }))),
    ...fixtureProjectCredentials.map((c) => ({ credential: seedId("credential", c.id), project: projectIdFor("project-a") })),
  ];
  // Linking to a project links its sandboxes too. (A seed reads fixtures, never another table.)
  const sandboxes = fixtureSandboxes();
  const sandboxesOf = (projectId: string): string[] => sandboxes.filter((s) => s.parentId === projectId).flatMap((s) => [s.id, ...sandboxesOf(s.id)]);
  return rootLinks.flatMap(({ credential, project }) =>
    [project, ...sandboxesOf(project)].map((projectId) => ({
      id: seedId("project_credential", `${credential}/${projectId}`),
      project_id: projectId,
      credential_id: credential,
      inserted_at: seedTime("1 Jun 2026"),
    })),
  );
});

export const oauthClients = table<OAuthClientRow>("oauth_clients", () =>
  userOAuthClients.map((c) => ({
    id: seedId("oauth_client", c.id),
    user_id: userIdFor("user-jane"),
    name: c.name,
    client_id: c.clientId,
    client_secret: "demo-secret-not-real",
    authorization_endpoint: c.authorizationEndpoint,
    token_endpoint: c.tokenEndpoint,
    revocation_endpoint: c.revocationEndpoint ?? null,
    userinfo_endpoint: c.userinfoEndpoint ?? null,
    introspection_endpoint: c.introspectionEndpoint ?? null,
    scopes_doc_url: c.scopesDocUrl ?? null,
    mandatory_scopes: c.mandatoryScopes.join(","),
    optional_scopes: c.optionalScopes.join(","),
    global: c.global,
    project_ids: c.projectIds.map(projectIdFor),
    inserted_at: seedTime("1 Jan 2026"),
    updated_at: seedTime("1 Jan 2026"),
  })),
);

// A step may use a link to its project, or to a project its project is a sandbox of.
setCredentialCheck((projectId, linkId) => {
  const l = projectCredentialLinks.rows().find((x) => x.id === linkId);
  for (let p = findProject(projectId); p; p = p.parent_id ? findProject(p.parent_id) : undefined) if (l?.project_id === p.id) return true;
  return false;
});

// A member who leaves a project takes their credentials' links there with them.
onMemberRemoved((projectId, userId) => {
  const theirs = new Set(credentials.rows().filter((c) => c.user_id === userId).map((c) => c.id));
  const dropped = projectCredentialLinks.rows().filter((l) => l.project_id === projectId && theirs.has(l.credential_id)).map((l) => l.id);
  if (!dropped.length) return;
  projectCredentialLinks.remove((l) => dropped.includes(l.id));
  clearFromSteps(dropped);
});

/** Takes these project-credential links off every step that used them. */
function clearFromSteps(linkIds: string[]) {
  workflows.update(
    (w) => w.jobs.some((j) => j.project_credential_id && linkIds.includes(j.project_credential_id)),
    (w) => ({ ...w, jobs: w.jobs.map((j) => (j.project_credential_id && linkIds.includes(j.project_credential_id) ? { ...j, project_credential_id: null } : j)) }),
  );
}

/* ------------------------------------------------------------------ */
/*  What the API sends                                                 */
/* ------------------------------------------------------------------ */

const me = () => currentUserId();
const isSuperuser = () => findUser(me())?.role === "superuser";
const linksOf = (credentialId: string) => projectCredentialLinks.rows().filter((l) => l.credential_id === credentialId);
const canSeeProject = (projectId: string) => !!roleIn(projectId);

export function credentialEntry(c: CredentialRow) {
  const links = linksOf(c.id).filter((l) => canSeeProject(l.project_id));
  const owner = findUser(c.user_id);
  const recipient = c.transfer_to ? findUser(c.transfer_to) : undefined;
  return {
    id: c.id,
    name: c.name,
    schema: c.schema,
    external_id: c.external_id,
    user_id: c.user_id,
    project_credentials: links.map((l) => ({ id: l.id, project_id: l.project_id, credential_id: c.id, inserted_at: l.inserted_at, updated_at: l.inserted_at })),
    projects: links.map((l) => findProject(l.project_id)).filter((p): p is ProjectRow => !!p).map((p) => ({ id: p.id, name: p.name, description: p.description })),
    // Planned.
    owner: owner ? { id: owner.id, email: owner.email, first_name: owner.first_name, last_name: owner.last_name } : null,
    environments: c.environments.map((e) => ({ name: e.name })),
    scheduled_deletion: c.scheduled_deletion,
    transfer_status: c.transfer_to ? "pending" : null,
    // The demo's: who a pending transfer waits on.
    transfer_recipient: recipient?.email ?? null,
    has_activity_in_projects: c.has_activity_in_projects,
    inserted_at: c.inserted_at,
    updated_at: c.updated_at,
  };
}

const one = (c: CredentialRow, status = 200) => json(status, { credential: credentialEntry(c) });

/** Visible if it's yours, or it's linked to a project you're in. Everyone else hears 403. */
function visible(id: string | undefined): CredentialRow | undefined {
  const c = isUuid(id) ? credentials.rows().find((r) => r.id === id) : undefined;
  if (!c) return undefined;
  return c.user_id === me() || linksOf(c.id).some((l) => canSeeProject(l.project_id)) ? c : undefined;
}

/** Yours to change: you own it, and it isn't being deleted. */
function owned(id: string | undefined): CredentialRow | Response {
  const c = isUuid(id) ? credentials.rows().find((r) => r.id === id) : undefined;
  if (!c || c.user_id !== me()) return forbidden();
  if (c.scheduled_deletion) return conflict("scheduled_for_deletion", "This credential is scheduled for deletion.");
  return c;
}

/* ------------------------------------------------------------------ */
/*  Validation                                                         */
/* ------------------------------------------------------------------ */

const ENV_NAME = /^[a-z0-9][a-z0-9_-]{0,31}$/;
const nameTaken = (userId: string, name: string, except?: string) =>
  credentials.rows().some((c) => c.user_id === userId && c.id !== except && c.name.trim().toLowerCase() === name.trim().toLowerCase());
const externalIdTaken = (projectId: string, externalId: string, except?: string) =>
  projectCredentialLinks
    .rows()
    .filter((l) => l.project_id === projectId && l.credential_id !== except)
    .some((l) => credentials.rows().find((c) => c.id === l.credential_id)?.external_id === externalId);

/** Links a credential to a project and its sandboxes; nothing if already linked. */
function link(c: CredentialRow, projectId: string): boolean {
  const already = linksOf(c.id).some((l) => l.project_id === projectId);
  const sandboxesOf = (id: string): string[] => projects.rows().filter((p) => p.parent_id === id && !p.scheduled_deletion).flatMap((p) => [p.id, ...sandboxesOf(p.id)]);
  for (const pid of [projectId, ...sandboxesOf(projectId)]) {
    if (!linksOf(c.id).some((l) => l.project_id === pid)) projectCredentialLinks.insert({ id: newId(), project_id: pid, credential_id: c.id, inserted_at: now() });
  }
  return !already;
}

/** The body for a new environment, or one replacing a stored one: a blank or missing secret keeps the stored value. */
function mergeBody(stored: Record<string, string> | undefined, sent: Record<string, unknown>): Record<string, string> {
  const next: Record<string, string> = { ...(stored ?? {}) };
  for (const [k, v] of Object.entries(sent)) if (typeof v === "string" && v !== "") next[k] = v;
  return next;
}

/* ------------------------------------------------------------------ */
/*  Routes                                                             */
/* ------------------------------------------------------------------ */

function create(body: Body): Response {
  const errors: Entry[] = unknownKeys(body, ["name", "schema", "external_id", "credential_bodies", "project_credentials"]);
  const name = typeof body["name"] === "string" ? body["name"].trim() : "";
  if (!name) errors.push({ code: "required", detail: "can't be blank", pointer: "#/name" });
  else if (nameTaken(me(), name)) errors.push({ code: "taken", detail: "has already been taken", pointer: "#/name" });
  if (typeof body["schema"] !== "string" || !body["schema"]) errors.push({ code: "required", detail: "can't be blank", pointer: "#/schema" });
  const bodies = (body["credential_bodies"] as { name?: unknown; body?: unknown }[] | undefined) ?? [];
  if (!Array.isArray(bodies) || bodies.length < 1) errors.push({ code: "required", detail: "needs at least one environment", pointer: "#/credential_bodies" });
  else if (bodies.length > 5) errors.push({ code: "exceeds_limit", detail: "a credential has at most 5 environments", pointer: "#/credential_bodies" });
  else
    bodies.forEach((b, i) => {
      if (typeof b?.name !== "string" || !ENV_NAME.test(b.name)) errors.push({ code: "format", detail: "must be lowercase letters, digits, - and _", pointer: `#/credential_bodies/${i}/name` });
      if (typeof b?.body !== "object" || b.body === null) errors.push({ code: "type", detail: "must be an object", pointer: `#/credential_bodies/${i}/body` });
    });
  const links = ((body["project_credentials"] as { project_id?: string }[] | undefined) ?? []).map((l) => l?.project_id);
  links.forEach((pid, i) => {
    const role = pid ? roleIn(pid) : undefined;
    if (!pid || !findProject(pid)) errors.push({ code: "not_found", detail: "is not a project", pointer: `#/project_credentials/${i}/project_id` });
    else if (!role || role === "viewer") errors.push({ code: "no_access", detail: "you can't share credentials there", pointer: `#/project_credentials/${i}/project_id` });
  });
  const externalId = typeof body["external_id"] === "string" && body["external_id"] ? body["external_id"] : null;
  if (externalId) links.forEach((pid, i) => pid && externalIdTaken(pid, externalId) && errors.push({ code: "taken", detail: "is used by another credential in this project", pointer: `#/project_credentials/${i}/project_id` }));
  if (errors.length) return invalid(errors);
  const at = now();
  const made: CredentialRow = {
    id: newId(),
    user_id: me(),
    name,
    schema: fullSchemaName(body["schema"] as string),
    external_id: externalId,
    environments: bodies.map((b) => ({ name: b.name as string, body: mergeBody(undefined, b.body as Record<string, unknown>), inserted_at: at, updated_at: at })),
    scheduled_deletion: null,
    transfer_to: null,
    has_activity_in_projects: false,
    inserted_at: at,
    updated_at: at,
  };
  credentials.insert(made);
  for (const pid of links) if (pid) link(made, pid);
  record("created", { type: "credential", id: made.id, name }, { after: { name, schema: made.schema } });
  for (const pid of links) if (pid) record("added_to_project", { type: "credential", id: made.id, name }, { after: { project: findProject(pid)?.name } });
  return one(made, 201);
}

export const credentialRoutes: Record<string, Handler> = {
  // Your own credentials, by name.
  "GET /api/credentials": (_params, _body, query) => {
    const projectId = query.get("project_id");
    if (projectId) return credentialRoutes["GET /api/projects/:project_id/credentials"]!({ project_id: projectId }, {}, query);
    const rows = credentials
      .rows()
      .filter((c) => c.user_id === me())
      .sort((a, b) => a.name.localeCompare(b.name))
      .map(credentialEntry);
    return json(200, paged("/api/credentials", rows, query, "credentials"));
  },
  // Every credential linked to a project, whoever owns it.
  "GET /api/projects/:project_id/credentials": ({ project_id }, _body, query) => {
    const p = guardProject(project_id!);
    if (p instanceof Response) return p;
    const ids = new Set(projectCredentialLinks.rows().filter((l) => l.project_id === p.id).map((l) => l.credential_id));
    const rows = credentials
      .rows()
      .filter((c) => ids.has(c.id) && !c.scheduled_deletion)
      .sort((a, b) => a.name.localeCompare(b.name))
      .map(credentialEntry);
    return json(200, paged(`/api/projects/${p.id}/credentials`, rows, query, "credentials"));
  },
  "GET /api/credentials/:id": ({ id }) => {
    const c = visible(id);
    return c ? one(c) : forbidden();
  },
  "POST /api/credentials": (_params, body) => create(body),

  // Renames it, changes its schema or external id, and replaces one environment's body.
  "PUT /api/credentials/:id": ({ id }, body) => {
    if (!isUuid(id)) return badId("id");
    const existing = credentials.rows().find((r) => r.id === id);
    if (!existing) return create(body);
    const c = owned(id);
    if (c instanceof Response) return c;
    const errors: Entry[] = unknownKeys(body, ["id", "name", "schema", "external_id", "owner", "credential_bodies", "project_credentials"]);
    const name = typeof body["name"] === "string" ? body["name"].trim() : c.name;
    if (!name) errors.push({ code: "required", detail: "can't be blank", pointer: "#/name" });
    else if (nameTaken(c.user_id, name, c.id)) errors.push({ code: "taken", detail: "has already been taken", pointer: "#/name" });
    if (body["owner"] !== undefined && body["owner"] !== findUser(c.user_id)?.email) errors.push({ code: "not_allowed", detail: "a credential never changes owner here", pointer: "#/owner" });
    const bodies = body["credential_bodies"] as { name: string; body: Record<string, unknown> }[] | undefined;
    if (bodies !== undefined && (!Array.isArray(bodies) || bodies.length !== 1)) errors.push({ code: "one_body", detail: "send exactly one environment", pointer: "#/credential_bodies" });
    const externalId = body["external_id"] === undefined ? c.external_id : (body["external_id"] as string | null) || null;
    if (externalId && externalId !== c.external_id) {
      for (const l of linksOf(c.id)) if (externalIdTaken(l.project_id, externalId, c.id)) errors.push({ code: "taken", detail: "is used by another credential in one of its projects", pointer: "#/external_id" });
    }
    if (errors.length) return invalid(errors);
    let environments = c.environments;
    if (bodies?.[0]) {
      const env = bodies[0];
      const stored = c.environments.find((e) => e.name === env.name);
      environments = stored
        ? c.environments.map((e) => (e.name === env.name ? { ...e, body: mergeBody(e.body, env.body), updated_at: now() } : e))
        : [...c.environments, { name: env.name, body: mergeBody(undefined, env.body), inserted_at: now(), updated_at: now() }];
    }
    const next = { ...c, name, schema: body["schema"] ? fullSchemaName(body["schema"] as string) : c.schema, external_id: externalId, environments, updated_at: now() };
    credentials.update((r) => r.id === c.id, () => next);
    if (name !== c.name || next.schema !== c.schema || externalId !== c.external_id) {
      record("updated", { type: "credential", id: c.id, name }, { before: { name: c.name }, after: { name } }, true);
    }
    return one(next);
  },

  // Deletes it at once, unless runs have used it.
  "DELETE /api/credentials/:id": ({ id }) => {
    const c = isUuid(id) ? credentials.rows().find((r) => r.id === id) : undefined;
    if (!c || c.user_id !== me()) return forbidden();
    if (c.has_activity_in_projects) return conflict("in_use", "Runs have used this credential, so it can't be deleted. Schedule its deletion instead.");
    const links = linksOf(c.id).map((l) => l.id);
    projectCredentialLinks.remove((l) => l.credential_id === c.id);
    clearFromSteps(links);
    credentials.remove((r) => r.id === c.id);
    record("deleted", { type: "credential", id: c.id, name: c.name }, {}, true);
    return noContent();
  },

  // Schedules it: off every project at once, its bodies emptied after the retention period.
  "PUT /api/credentials/:id/scheduled_deletion": ({ id }) => {
    const c = isUuid(id) ? credentials.rows().find((r) => r.id === id) : undefined;
    if (!c || c.user_id !== me()) return forbidden();
    if (!c.scheduled_deletion) {
      const links = linksOf(c.id).map((l) => l.id);
      projectCredentialLinks.remove((l) => l.credential_id === c.id);
      clearFromSteps(links);
      credentials.update((r) => r.id === c.id, (r) => ({ ...r, scheduled_deletion: now(), updated_at: now() }));
    }
    return one(credentials.rows().find((r) => r.id === c.id)!);
  },
  "DELETE /api/credentials/:id/scheduled_deletion": ({ id }) => {
    const c = isUuid(id) ? credentials.rows().find((r) => r.id === id) : undefined;
    if (!c || c.user_id !== me()) return forbidden();
    if (!c.scheduled_deletion) return notFound();
    credentials.update((r) => r.id === c.id, (r) => ({ ...r, scheduled_deletion: null, updated_at: now() }));
    record("updated", { type: "credential", id: c.id, name: c.name }, { before: { scheduled_deletion: c.scheduled_deletion }, after: { scheduled_deletion: null } });
    return one(credentials.rows().find((r) => r.id === c.id)!);
  },

  /* ---------------- Projects ---------------- */

  // Links it to a project (and its sandboxes). The owner must be in the project.
  "PUT /api/projects/:project_id/credentials/:id": ({ project_id, id }) => {
    const p = guardProject(project_id!, "editor");
    if (p instanceof Response) return p;
    const c = owned(id);
    if (c instanceof Response) return c;
    if (!members.rows().some((m) => m.project_id === p.id && m.user_id === c.user_id)) {
      return invalid([{ code: "no_access", detail: "the owner isn't a member of this project", path: "project_id" }]);
    }
    if (c.external_id && externalIdTaken(p.id, c.external_id, c.id)) return invalid([{ code: "taken", detail: "another credential here has this external id", pointer: "#/external_id" }]);
    const made = link(c, p.id);
    if (made) record("added_to_project", { type: "credential", id: c.id, name: c.name }, { after: { project: p.name } });
    return one(c, made ? 201 : 200);
  },
  // Unlinks it: the project's steps lose it; its sandboxes keep their links.
  "DELETE /api/projects/:project_id/credentials/:id": ({ project_id, id }) => {
    const p = guardProject(project_id!, "viewer");
    if (p instanceof Response) return p;
    const c = isUuid(id) ? credentials.rows().find((r) => r.id === id) : undefined;
    if (!c) return notFound();
    const role = roleIn(p.id);
    if (c.user_id !== me() && role !== "owner" && role !== "admin") return forbidden();
    const l = linksOf(c.id).find((x) => x.project_id === p.id);
    if (!l) return notFound();
    projectCredentialLinks.remove((x) => x.id === l.id);
    clearFromSteps([l.id]);
    record("removed_from_project", { type: "credential", id: c.id, name: c.name }, { before: { project: p.name } }, true);
    return noContent();
  },

  /* ---------------- Environments ---------------- */

  "GET /api/credentials/:id/environments": ({ id }) => {
    const c = owned(id);
    if (c instanceof Response) return c;
    const schema = findSchema(c.schema);
    return json(200, {
      data: c.environments.map((e) => ({
        name: e.name,
        // Not in api/ (which never sends bodies): the values that aren't secret, so a form can show them.
        values: withoutSecrets(e.body, schema),
        inserted_at: e.inserted_at,
        updated_at: e.updated_at,
      })),
    });
  },
  "PUT /api/credentials/:id/environments/:name": ({ id, name }, body) => {
    const c = owned(id);
    if (c instanceof Response) return c;
    if (!ENV_NAME.test(name!)) return invalid([{ code: "format", detail: "must be lowercase letters, digits, - and _", path: "name" }]);
    if (typeof body["body"] !== "object" || body["body"] === null) return invalid([{ code: "required", detail: "must be an object", pointer: "#/body" }]);
    const stored = c.environments.find((e) => e.name === name);
    if (!stored && c.environments.length >= 5) return invalid([{ code: "exceeds_limit", detail: "a credential has at most 5 environments", path: "name" }]);
    const at = now();
    const environments = stored
      ? c.environments.map((e) => (e.name === name ? { ...e, body: mergeBody(e.body, body["body"] as Record<string, unknown>), updated_at: at } : e))
      : [...c.environments, { name: name!, body: mergeBody(undefined, body["body"] as Record<string, unknown>), inserted_at: at, updated_at: at }];
    credentials.update((r) => r.id === c.id, (r) => ({ ...r, environments, updated_at: at }));
    return json(stored ? 200 : 201, { data: { name, inserted_at: stored?.inserted_at ?? at, updated_at: at } });
  },
  "DELETE /api/credentials/:id/environments/:name": ({ id, name }) => {
    const c = owned(id);
    if (c instanceof Response) return c;
    if (!c.environments.some((e) => e.name === name)) return notFound();
    if (c.environments.length === 1) return invalid([{ code: "required", detail: "a credential keeps at least one environment", path: "name" }]);
    credentials.update((r) => r.id === c.id, (r) => ({ ...r, environments: r.environments.filter((e) => e.name !== name), updated_at: now() }));
    return noContent();
  },

  /* ---------------- Transfer ---------------- */

  // Asks someone to take it on; they must be in every project it's linked to.
  "PUT /api/credentials/:id/transfer": ({ id }, body) => {
    const c = owned(id);
    if (c instanceof Response) return c;
    const email = typeof body["recipient"] === "string" ? body["recipient"].trim() : "";
    const recipient = email ? findUserByEmail(email) : undefined;
    if (!recipient) return invalid([{ code: "not_found", detail: "is not a user on this instance", pointer: "#/recipient" }]);
    if (recipient.id === c.user_id) return invalid([{ code: "invalid", detail: "is already the owner", pointer: "#/recipient" }]);
    const missing = linksOf(c.id)
      .map((l) => findProject(l.project_id))
      .filter((p): p is ProjectRow => !!p && !p.parent_id && !members.rows().some((m) => m.project_id === p.id && m.user_id === recipient.id));
    if (missing.length) return invalid([{ code: "no_access", detail: `isn't a member of ${missing.map((p) => p.name).join(", ")}`, pointer: "#/recipient" }]);
    credentials.update((r) => r.id === c.id, (r) => ({ ...r, transfer_to: recipient.id }));
    return one(credentials.rows().find((r) => r.id === c.id)!);
  },
  "DELETE /api/credentials/:id/transfer": ({ id }) => {
    const c = owned(id);
    if (c instanceof Response) return c;
    if (!c.transfer_to) return notFound();
    credentials.update((r) => r.id === c.id, (r) => ({ ...r, transfer_to: null }));
    return one(credentials.rows().find((r) => r.id === c.id)!);
  },

  /* ---------------- OAuth clients ---------------- */

  "GET /api/oauth_clients": (_params, _body, query) => {
    const rows = oauthClients
      .rows()
      .filter((o) => o.user_id === me() || o.global)
      .sort((a, b) => a.name.localeCompare(b.name))
      .map(oauthEntry);
    return json(200, paged("/api/oauth_clients", rows, query));
  },
  "PUT /api/oauth_clients/:id": ({ id }, body) => {
    if (!isUuid(id)) return badId("id");
    const existing = oauthClients.rows().find((o) => o.id === id);
    if (existing && existing.user_id !== me()) return forbidden();
    const errors: Entry[] = unknownKeys(body, [
      "name", "client_id", "client_secret", "authorization_endpoint", "token_endpoint", "revocation_endpoint",
      "userinfo_endpoint", "introspection_endpoint", "scopes_doc_url", "mandatory_scopes", "optional_scopes", "global", "project_ids",
    ]);
    const required = ["name", "client_id", "authorization_endpoint", "token_endpoint", ...(existing ? [] : ["client_secret"])];
    for (const key of required) if (typeof body[key] !== "string" || !(body[key] as string).trim()) errors.push({ code: "required", detail: "can't be blank", pointer: `#/${key}` });
    for (const key of ["authorization_endpoint", "token_endpoint", "revocation_endpoint", "userinfo_endpoint", "introspection_endpoint", "scopes_doc_url"]) {
      const v = body[key];
      if (typeof v === "string" && v && !/^https?:\/\/\S+$/.test(v)) errors.push({ code: "format", detail: "must be a URL", pointer: `#/${key}` });
    }
    if (body["global"] === true && !isSuperuser()) errors.push({ code: "not_allowed", detail: "only a superuser can make a global client", pointer: "#/global" });
    const projectIds = (body["project_ids"] as string[] | undefined) ?? existing?.project_ids ?? [];
    projectIds.forEach((pid, i) => {
      const role = roleIn(pid);
      if (!role || role === "viewer") errors.push({ code: "no_access", detail: "you can't share it there", pointer: `#/project_ids/${i}` });
    });
    if (errors.length) return invalid(errors);
    const at = now();
    const str = (key: string) => (typeof body[key] === "string" && body[key] ? (body[key] as string) : null);
    const row: OAuthClientRow = {
      id: id!,
      user_id: existing?.user_id ?? me(),
      name: (body["name"] as string).trim(),
      client_id: body["client_id"] as string,
      client_secret: str("client_secret") ?? existing?.client_secret ?? "",
      authorization_endpoint: body["authorization_endpoint"] as string,
      token_endpoint: body["token_endpoint"] as string,
      revocation_endpoint: str("revocation_endpoint"),
      userinfo_endpoint: str("userinfo_endpoint"),
      introspection_endpoint: str("introspection_endpoint"),
      scopes_doc_url: str("scopes_doc_url"),
      mandatory_scopes: (body["mandatory_scopes"] as string | undefined) ?? "",
      optional_scopes: (body["optional_scopes"] as string | undefined) ?? "",
      global: body["global"] === true,
      project_ids: projectIds,
      inserted_at: existing?.inserted_at ?? at,
      updated_at: at,
    };
    if (existing) oauthClients.update((o) => o.id === id, () => row);
    else oauthClients.insert(row);
    record(existing ? "updated" : "created", { type: "oauth_client", id: row.id, name: row.name }, existing ? {} : { after: { name: row.name } }, true);
    return json(existing ? 200 : 201, { data: oauthEntry(row) });
  },
  "DELETE /api/oauth_clients/:id": ({ id }) => {
    const o = isUuid(id) ? oauthClients.rows().find((r) => r.id === id) : undefined;
    if (!o || o.user_id !== me()) return forbidden();
    oauthClients.remove((r) => r.id === o.id);
    record("deleted", { type: "oauth_client", id: o.id, name: o.name }, {}, true);
    return noContent();
  },
};

/** An OAuth client as the API sends it: never its secret. */
function oauthEntry(o: OAuthClientRow) {
  const { client_secret: _secret, ...shown } = o;
  void _secret;
  return shown;
}
