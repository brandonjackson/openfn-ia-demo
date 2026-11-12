/**
 * Channels and their requests on the pretend server (api/channels.md).
 *
 * Lifecycle, as the API has it:
 * - `PUT …/channels/:id` makes one (201) or changes it (200). Its name is
 *   unique in the project; its destination is an http(s) URL; its client
 *   auth methods are the project's webhook auth methods, and its
 *   destination credential one linked to the project. Every change bumps
 *   `lock_version`; a stale one is a 409 `concurrent_edit`.
 * - Turned off (`enabled: false`), it refuses every request.
 * - `DELETE` removes it and every request it recorded.
 * - Editors and up make, change and delete them; any member reads them.
 * - A sandbox gets its own copy of each of its parent's when it's made,
 *   with no requests or traffic, and a merge brings its new and changed ones
 *   back (sandboxes.ts). Like its steps, a sandbox's channel may use its
 *   parent's credentials and webhook auth methods. Lightning doesn't copy
 *   channels into sandboxes yet; the demo does, as it does every component.
 *
 * The demo's channels say more than Lightning's: a description, a kind
 * (read, write or event), the system on the other end, a sample payload, a
 * week of traffic and the workflow it belongs to. They ride along as extra
 * fields, which a real Lightning would drop.
 */
import { channelDetails } from "../fixtures/channels";
import { projects as fixtureProjects } from "../fixtures/projects";
import { apiChannelId, apiWorkflowId, seedId } from "../fixtures/ids";
import type { ChannelDetails, ChannelMessage } from "../model/channels";
import { badId, conflict, invalid, isUuid, json, noContent, notFound, now, ORIGIN, paged, unknownKeys, type Entry, type Handler } from "./answers";
import { record } from "./audit";
import { ago, seedTime, table } from "./db";
import { findProject, guardProject, projectIdFor } from "./projects";
import { withSandboxCopies } from "./sandbox-copies";
import { canUseCredential } from "./workflows";
import { onWebhookAuthDeleted, webhookAuthMethods } from "./webhook-auth";

export interface ChannelRow {
  id: string;
  project_id: string;
  name: string;
  destination_url: string;
  enabled: boolean;
  lock_version: number;
  client_auth_method_ids: string[];
  destination_credential_id: string | null;
  inserted_at: string;
  updated_at: string;
  // The demo's own.
  description: string;
  channel_type: ChannelDetails["channelType"];
  system: { name: string; adaptor: string };
  method: "GET" | "POST";
  auth: string;
  payload: string;
  days: ChannelDetails["days"];
  median_ms: number;
  workflow_id: string | null;
}

export interface ChannelRequestRow {
  id: string;
  channel_id: string;
  request_id: string;
  state: "pending" | "success" | "failed" | "timeout" | "error";
  path: string;
  started_at: string;
  completed_at: string;
  // The demo's own: what the message was, as the channel's page shows it.
  status: number;
  duration_ms: number;
  summary: string;
  run_id: string | null;
  body: string;
  at: string;
}

/** A fixture channel's id on the API, from its project's slug and its own. */
export const channelIdFor = apiChannelId;

const fixtureChannels = () =>
  fixtureProjects.flatMap((p) => p.components.filter((c) => c.type === "Channel").map((c) => ({ project: p, component: c, details: channelDetails(c) })));

/** A week with nothing on it, for a channel that's had no traffic. */
export const quietWeek = (): ChannelDetails["days"] =>
  ["14 Oct", "15 Oct", "16 Oct", "17 Oct", "18 Oct", "19 Oct", "20 Oct"].map((label, i) => ({ label, tick: ["Wed", "Thu", "Fri", "Sat", "Sun", "Mon", "Tue"][i]!, messages: 0, errors: 0 }));

/** A sandbox's copy of a channel: its setup, with no traffic yet, on the sandbox's copy of its workflow. */
export const copyChannel = (c: ChannelRow, sandboxId: string): ChannelRow => ({
  ...c,
  id: seedId("channel", `${sandboxId}/${c.id}`),
  project_id: sandboxId,
  lock_version: 1,
  days: quietWeek(),
  median_ms: 0,
  // The id cloneInto gives the sandbox's copy of the workflow.
  workflow_id: c.workflow_id && seedId("workflow", `${sandboxId}/${c.workflow_id}`),
});

/** Whether a project may use a webhook auth method: its own, or one of a project it's a sandbox of. */
export function canUseAuthMethod(projectId: string, methodId: string): boolean {
  const m = webhookAuthMethods.rows().find((w) => w.id === methodId && !w.scheduled_deletion);
  for (let p = findProject(projectId); p; p = p.parent_id ? findProject(p.parent_id) : undefined) if (m?.project_id === p.id) return true;
  return false;
}

/** Every project's channels, as the fixtures have them, before the sandboxes' copies. */
const channelsSeed = (): ChannelRow[] =>
  fixtureChannels().map(({ project, component, details }): ChannelRow => ({
    id: channelIdFor(project.id, component.id),
    project_id: projectIdFor(project.id),
    name: component.name,
    destination_url: details.endpoint,
    enabled: details.enabled ?? true,
    lock_version: 1,
    client_auth_method_ids: [],
    destination_credential_id: null,
    inserted_at: seedTime("1 Jun 2026"),
    updated_at: seedTime("1 Jun 2026"),
    description: component.description,
    channel_type: details.channelType,
    system: details.system,
    method: details.method,
    auth: details.auth,
    payload: details.payload,
    days: details.days,
    median_ms: details.medianMs,
    workflow_id: details.workflowId ? apiWorkflowId(details.workflowId) : null,
  }));

export const channels = table<ChannelRow>("channels", () => withSandboxCopies(channelsSeed(), copyChannel));

export const channelRequests = table<ChannelRequestRow>("channel_requests", () =>
  fixtureChannels().flatMap(({ project, component, details }) =>
    details.messages.map((m: ChannelMessage, i) => ({
      id: seedId("channel_request", `${project.id}/${component.id}/${m.id}`),
      channel_id: channelIdFor(project.id, component.id),
      request_id: m.id,
      state: m.status < 400 ? "success" : "failed",
      path: "/",
      started_at: ago((i + 1) * 3_600_000),
      completed_at: ago((i + 1) * 3_600_000 - m.durationMs),
      status: m.status,
      duration_ms: m.durationMs,
      summary: m.summary,
      run_id: m.runId ?? null,
      body: m.body,
      at: m.at,
    })),
  ),
);

// A webhook auth method that's deleted is taken off every channel at once.
onWebhookAuthDeleted((methodId) =>
  channels.update(
    (c) => c.client_auth_method_ids.includes(methodId),
    (c) => ({ ...c, client_auth_method_ids: c.client_auth_method_ids.filter((m) => m !== methodId), lock_version: c.lock_version + 1 }),
  ),
);

const requestsOf = (id: string) => channelRequests.rows().filter((r) => r.channel_id === id);

export function channelEntry(c: ChannelRow) {
  const requests = requestsOf(c.id);
  return {
    type: "channels",
    id: c.id,
    attributes: {
      name: c.name,
      destination_url: c.destination_url,
      enabled: c.enabled,
      lock_version: c.lock_version,
      url: `${ORIGIN}/channels/${c.id}`,
      client_auth_method_ids: c.client_auth_method_ids,
      destination_credential_id: c.destination_credential_id,
      request_count: requests.length,
      last_activity: requests.map((r) => r.started_at).sort().at(-1) ?? null,
      inserted_at: c.inserted_at,
      updated_at: c.updated_at,
      description: c.description,
      channel_type: c.channel_type,
      system: c.system,
      method: c.method,
      auth: c.auth,
      payload: c.payload,
      days: c.days,
      median_ms: c.median_ms,
      workflow_id: c.workflow_id,
    },
    relationships: {},
    links: { self: `${ORIGIN}/api/projects/${c.project_id}/channels/${c.id}` },
  };
}

const requestEntry = (r: ChannelRequestRow) => ({
  type: "channel_requests",
  id: r.id,
  attributes: {
    channel_id: r.channel_id,
    request_id: r.request_id,
    state: r.state,
    path: r.path,
    error_message: r.state === "success" ? null : r.summary,
    started_at: r.started_at,
    completed_at: r.completed_at,
    status: r.status,
    duration_ms: r.duration_ms,
    summary: r.summary,
    run_id: r.run_id,
    body: r.body,
    at: r.at,
  },
  relationships: {},
  links: { self: `${ORIGIN}/api/channel_requests/${r.id}` },
});

const CHANNEL_KEYS = [
  "name", "destination_url", "enabled", "client_auth_method_ids", "destination_credential_id", "lock_version",
  "description", "channel_type", "system", "method", "auth", "payload", "workflow_id",
];

export const channelRoutes: Record<string, Handler> = {
  // By name, with the whole project's totals.
  "GET /api/projects/:project_id/channels": ({ project_id }, _body, query) => {
    const p = guardProject(project_id!);
    if (p instanceof Response) return p;
    const own = channels.rows().filter((c) => c.project_id === p.id);
    const rows = own.sort((a, b) => a.name.localeCompare(b.name)).map(channelEntry);
    return json(200, {
      ...paged(`/api/projects/${p.id}/channels`, rows, query),
      meta: { total_channels: own.length, total_requests: own.reduce((n, c) => n + requestsOf(c.id).length, 0) },
    });
  },
  "GET /api/projects/:project_id/channels/:id": ({ project_id, id }) => {
    const p = guardProject(project_id!);
    if (p instanceof Response) return p;
    if (!isUuid(id)) return badId("id");
    const c = channels.rows().find((r) => r.id === id && r.project_id === p.id);
    return c ? json(200, { data: channelEntry(c) }) : notFound();
  },
  "PUT /api/projects/:project_id/channels/:id": ({ project_id, id }, body) => {
    const p = guardProject(project_id!, "editor");
    if (p instanceof Response) return p;
    if (!isUuid(id)) return badId("id");
    const existing = channels.rows().find((r) => r.id === id);
    if (existing && existing.project_id !== p.id) return conflict("id_taken", "That id belongs to a channel in another project.");
    const errors: Entry[] = unknownKeys(body, CHANNEL_KEYS);
    const name = typeof body["name"] === "string" ? body["name"].trim() : existing?.name ?? "";
    if (!name) errors.push({ code: "required", detail: "can't be blank", pointer: "#/name" });
    else if (channels.rows().some((c) => c.project_id === p.id && c.id !== id && c.name.toLowerCase() === name.toLowerCase())) errors.push({ code: "taken", detail: "has already been taken", pointer: "#/name" });
    const url = (body["destination_url"] as string | undefined) ?? existing?.destination_url;
    if (!url) errors.push({ code: "required", detail: "can't be blank", pointer: "#/destination_url" });
    else if (!/^https?:\/\/\S+$/.test(url)) errors.push({ code: "format", detail: "must be an http or https URL", pointer: "#/destination_url" });
    const methods = (body["client_auth_method_ids"] as string[] | undefined) ?? existing?.client_auth_method_ids ?? [];
    methods.forEach((m, i) => {
      if (!canUseAuthMethod(p.id, m)) errors.push({ code: "not_found", detail: "isn't one of this project's webhook auth methods", pointer: `#/client_auth_method_ids/${i}` });
    });
    const credential = body["destination_credential_id"] === undefined ? existing?.destination_credential_id ?? null : (body["destination_credential_id"] as string | null);
    if (credential && !canUseCredential(p.id, credential)) {
      errors.push({ code: "not_found", detail: "isn't a credential linked to this project", pointer: "#/destination_credential_id" });
    }
    if (errors.length) return invalid(errors);
    if (existing && typeof body["lock_version"] === "number" && body["lock_version"] !== existing.lock_version) {
      return conflict("concurrent_edit", "Someone else changed this channel. Fetch it again and retry.");
    }
    const at = now();
    const pick = <K extends keyof ChannelRow>(key: K, fallback: ChannelRow[K]): ChannelRow[K] => (body[key] !== undefined ? (body[key] as ChannelRow[K]) : (existing?.[key] ?? fallback));
    const row: ChannelRow = {
      id: id!,
      project_id: p.id,
      name,
      destination_url: url!,
      enabled: pick("enabled", true),
      lock_version: (existing?.lock_version ?? 0) + 1,
      client_auth_method_ids: methods,
      destination_credential_id: credential,
      inserted_at: existing?.inserted_at ?? at,
      updated_at: at,
      description: pick("description", ""),
      channel_type: pick("channel_type", "write"),
      system: pick("system", { name: "", adaptor: "http" }),
      method: pick("method", "POST"),
      auth: pick("auth", "None"),
      payload: pick("payload", "{}"),
      days: existing?.days ?? quietWeek(),
      median_ms: existing?.median_ms ?? 0,
      workflow_id: pick("workflow_id", null),
    };
    if (existing) channels.update((c) => c.id === id, () => row);
    else channels.insert(row);
    record(existing ? "updated" : "created", { type: "channel", id: row.id, name }, existing ? {} : { after: { name } }, true);
    return json(existing ? 200 : 201, { data: channelEntry(row) });
  },
  // Removes it and every request it recorded.
  "DELETE /api/projects/:project_id/channels/:id": ({ project_id, id }) => {
    const p = guardProject(project_id!, "editor");
    if (p instanceof Response) return p;
    if (!isUuid(id)) return badId("id");
    const c = channels.rows().find((r) => r.id === id && r.project_id === p.id);
    if (!c) return notFound();
    channels.remove((r) => r.id === id);
    channelRequests.remove((r) => r.channel_id === id);
    record("deleted", { type: "channel", id: c.id, name: c.name }, {}, true);
    return noContent();
  },

  // Newest first; one channel's with ?channel_id=.
  "GET /api/projects/:project_id/channel_requests": ({ project_id }, _body, query) => {
    const p = guardProject(project_id!);
    if (p instanceof Response) return p;
    const own = new Set(channels.rows().filter((c) => c.project_id === p.id).map((c) => c.id));
    const channelId = query.get("channel_id");
    const rows = channelRequests
      .rows()
      .filter((r) => own.has(r.channel_id) && (!channelId || r.channel_id === channelId))
      .sort((a, b) => b.started_at.localeCompare(a.started_at))
      .map(requestEntry);
    return json(200, paged(`/api/projects/${p.id}/channel_requests`, rows, query, "data", true));
  },
};
