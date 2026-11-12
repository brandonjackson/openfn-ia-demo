/**
 * Sandboxes on the pretend server (api/projects.md, Sandboxes). A sandbox
 * is a project made from another, with `parent_id` pointing back.
 *
 * Lifecycle, as the API has it:
 * - `PUT …/sandboxes/:id` makes one: a copy of every workflow (every trigger
 *   off), the parent's members (its owner becomes an admin, you the owner)
 *   and its MFA setting. Its name is unique among the parent's sandboxes.
 *   Sending it again answers 200 with the sandbox unchanged.
 * - A sandbox is a copy of its project, so its components and environment
 *   variables come along too: a copy of each channel (no requests or
 *   traffic), form, artifact, AI skill, document and static website, and
 *   each variable with its values. Collections come as Lightning makes
 *   them: an empty one of the same name for each (names, never items).
 * - A merge preview pairs the sandbox's workflows with the target's by name
 *   and says what's new, changed, unchanged or deleted, and whether the
 *   target changed since the copy was made. It does the same for the
 *   components (by kind and name) and the environment variables (by the one
 *   each was copied from, or key), which are only ever new, changed or
 *   unchanged: a merge never deletes them. It writes nothing.
 * - A merge copies the chosen workflows into the target (by default the
 *   parent) as a new version of each, keeping the target's trigger switches,
 *   and brings every new and changed component and variable with them. A
 *   collection only the sandbox has is made, empty, in the target; the
 *   target's collections keep their items. A channel keeps the target's
 *   switch and traffic.
 * - Renaming and recolouring go through `PUT /api/projects/:id`; deleting
 *   through `DELETE /api/projects/:id`, which takes its own sandboxes too.
 */
import { cloneNodeId, newId } from "../fixtures/ids";
import { canUseAuthMethod, channels, copyChannel, quietWeek, type ChannelRow } from "./channels";
import { collections, copyCollection } from "./collections";
import { copyEnvVar, envVars, type EnvVarRow } from "./env-vars";
import { components, copyComponent, type ComponentRow } from "./project-components";
import { findUser, fullName } from "./users";
import { conflict, forbidden, includes, invalid, isUuid, json, now, paged, unknownKeys, type Entry, type Handler } from "./answers";
import { record } from "./audit";
import { findProject, guardProject, members, membersOf, projectEntry, projects, roleIn, rootOf, type ProjectRow } from "./projects";
import { currentUserId } from "./session";
import { copyDataclipsInto } from "./work-orders";
import { canUseCredential, cloneInto, findWorkflow, liveWorkflowsIn, saveWorkflow, snapshot, workflows, type WorkflowRow } from "./workflows";

const HEX = /^#[0-9a-fA-F]{6}$/;
const NAME = /^[a-z0-9-]+$/;
const MAX_DEPTH = 5;

const depthOf = (p: ProjectRow): number => (p.parent_id ? 1 + depthOf(findProject(p.parent_id)!) : 0);
const childrenOf = (id: string) => projects.rows().filter((p) => p.parent_id === id);

/** A sandbox's workflows paired with a target's by name, as a merge sees them. */
function pairs(sandbox: ProjectRow, target: ProjectRow) {
  const mine = liveWorkflowsIn(sandbox.id);
  const theirs = liveWorkflowsIn(target.id);
  return {
    mine: mine.map((w) => ({ w, target: theirs.find((t) => t.name === w.name) })),
    // Only in the target, and there before the sandbox was made: the sandbox deleted it.
    gone: theirs.filter((t) => !mine.some((w) => w.name === t.name) && t.inserted_at <= sandbox.inserted_at),
  };
}

/** The ids in a sandbox's copy, mapped back to the ones they were copied from in the target where they were. */
function mapBack(sandbox: ProjectRow, target: WorkflowRow) {
  const original = new Map<string, string>();
  for (const id of [...target.jobs.map((j) => j.id), ...target.triggers.map((t) => t.id), ...target.edges.map((e) => e.id)]) {
    original.set(cloneNodeId(sandbox.id, id), id);
  }
  return (id: string | null) => (id === null ? null : (original.get(id) ?? id));
}

/** A workflow's content without its ids or switches, to tell whether two copies differ. */
function content(w: WorkflowRow, back: (id: string | null) => string | null) {
  return JSON.stringify({
    name: w.name,
    jobs: w.jobs.map((j) => ({ ...j, id: back(j.id) })).sort((a, b) => a.id!.localeCompare(b.id!)),
    triggers: w.triggers.map((t) => ({ type: t.type, cron: t.cron_expression, id: back(t.id) })),
    edges: w.edges
      .map((e) => ({ s: back(e.source_trigger_id ?? e.source_job_id), t: back(e.target_job_id), c: e.condition_type, x: e.condition_expression }))
      .sort((a, b) => `${a.s}${a.t}`.localeCompare(`${b.s}${b.t}`)),
  });
}

function preview(sandbox: ProjectRow, target: ProjectRow) {
  const { mine, gone } = pairs(sandbox, target);
  return {
    target_project_id: target.id,
    workflows: [
      ...mine.map(({ w, target: t }) => ({
        name: w.name,
        source_workflow_id: w.id,
        target_workflow_id: t?.id ?? null,
        change: !t ? "new" : content(w, mapBack(sandbox, t)) === content(t, (id) => id) ? "unchanged" : "changed",
        diverged: !!t && !!w.copied_from && w.copied_from.workflow_id === t.id && t.lock_version > w.copied_from.lock_version,
      })),
      ...gone.map((t) => ({ name: t.name, source_workflow_id: null, target_workflow_id: t.id, change: "deleted", diverged: false })),
    ],
    components: componentPairs(sandbox, target).map(({ type, name, mine, theirs, same }) => ({
      component_type: type,
      name,
      source_id: mine.id,
      target_id: theirs?.id ?? null,
      change: !theirs ? "new" : same ? "unchanged" : "changed",
    })),
    env_vars: envVarPairs(sandbox, target).map(({ mine, theirs, same }) => ({
      key: mine.key,
      environments: mine.environments,
      source_id: mine.id,
      target_id: theirs?.id ?? null,
      change: !theirs ? "new" : same ? "unchanged" : "changed",
    })),
    // Credentials the sandbox uses that the target lacks: none until credentials move to the API.
    credentials: [] as { credential_id: string; name: string }[],
  };
}

/* ---------------- Components and environment variables ---------------- */

/** Every component of a project, as a merge pairs them: by kind and name. */
const componentKey = (type: string, name: string) => `${type}/${name.toLowerCase()}`;

/** A channel's workflow, by name, so a sandbox's copy and the target's compare. */
const workflowName = (id: string | null) => (id ? (findWorkflow(id)?.name ?? null) : null);

/** A channel's setup, without its id, switch or traffic, to tell whether two copies differ. */
const channelContent = (c: ChannelRow) =>
  JSON.stringify({
    name: c.name,
    url: c.destination_url,
    auth: [...c.client_auth_method_ids].sort(),
    credential: c.destination_credential_id,
    description: c.description,
    type: c.channel_type,
    system: c.system,
    method: c.method,
    authLabel: c.auth,
    payload: c.payload,
    workflow: workflowName(c.workflow_id),
  });

const fileContent = (c: ComponentRow) => JSON.stringify({ name: c.name, description: c.description, content: c.content });

interface ComponentPair {
  type: string;
  name: string;
  mine: { id: string };
  theirs?: { id: string };
  same: boolean;
  apply: () => void;
}

/**
 * A sandbox's components paired with a target's: each channel, collection
 * and file of the sandbox with the target's of the same kind and name, if
 * there is one, whether they're the same, and what merging it does.
 */
function componentPairs(sandbox: ProjectRow, target: ProjectRow): ComponentPair[] {
  const at = now;
  const me = () => {
    const u = findUser(currentUserId());
    return u ? fullName(u) : "Someone";
  };
  const theirChannels = channels.rows().filter((c) => c.project_id === target.id);
  const theirCollections = collections.rows().filter((c) => c.project_id === target.id);
  const theirFiles = components.rows().filter((c) => c.project_id === target.id);
  // The target's workflow of the same name as the sandbox's, once the merge's workflows are in.
  const workflowThere = (id: string | null) => {
    const name = workflowName(id);
    return (name && liveWorkflowsIn(target.id).find((w) => w.name === name)?.id) || null;
  };
  // What a channel of the sandbox's becomes in the target: its auth and credential where the target may use them.
  const channelThere = (c: ChannelRow): Pick<ChannelRow, "client_auth_method_ids" | "destination_credential_id" | "workflow_id"> => ({
    client_auth_method_ids: c.client_auth_method_ids.filter((m) => canUseAuthMethod(target.id, m)),
    destination_credential_id: c.destination_credential_id && canUseCredential(target.id, c.destination_credential_id) ? c.destination_credential_id : null,
    workflow_id: workflowThere(c.workflow_id),
  });

  return [
    ...channels
      .rows()
      .filter((c) => c.project_id === sandbox.id)
      .map((c): ComponentPair => {
        const theirs = theirChannels.find((t) => t.name.toLowerCase() === c.name.toLowerCase());
        return {
          type: "Channel",
          name: c.name,
          mine: c,
          theirs,
          same: !!theirs && channelContent(c) === channelContent(theirs),
          apply: () => {
            if (theirs) {
              // The target keeps its own id, switch and traffic.
              channels.update(
                (x) => x.id === theirs.id,
                (x) => ({ ...c, ...channelThere(c), id: x.id, project_id: x.project_id, enabled: x.enabled, days: x.days, median_ms: x.median_ms, lock_version: x.lock_version + 1, inserted_at: x.inserted_at, updated_at: at() }),
              );
              record("updated", { type: "channel", id: theirs.id, name: c.name }, {}, true);
            } else {
              const made: ChannelRow = { ...copyChannel(c, target.id), ...channelThere(c), id: newId(), days: quietWeek(), inserted_at: at(), updated_at: at() };
              channels.insert(made);
              record("created", { type: "channel", id: made.id, name: made.name }, { after: { name: made.name } }, true);
            }
          },
        };
      }),
    ...collections
      .rows()
      .filter((c) => c.project_id === sandbox.id)
      .map((c): ComponentPair => {
        const theirs = theirCollections.find((t) => t.name === c.name);
        return {
          type: "Collection",
          name: c.name,
          mine: c,
          theirs,
          // Only names merge, so one the target has is the same.
          same: !!theirs,
          apply: () => {
            if (theirs) return;
            const made = { ...copyCollection(c, target.id, at()), id: newId() };
            collections.insert(made);
            record("created", { type: "collection", id: made.id, name: made.name }, { after: { name: made.name } });
          },
        };
      }),
    ...components
      .rows()
      .filter((c) => c.project_id === sandbox.id)
      .map((c): ComponentPair => {
        const theirs = theirFiles.find((t) => componentKey(t.type, t.name) === componentKey(c.type, c.name));
        return {
          type: c.type,
          name: c.name,
          mine: c,
          theirs,
          same: !!theirs && fileContent(c) === fileContent(theirs),
          apply: () => {
            if (theirs) {
              components.update(
                (x) => x.id === theirs.id,
                (x) => ({ ...x, name: c.name, description: c.description, content: c.content, lock_version: x.lock_version + 1, updated_by: me(), updated_at: at() }),
              );
              record("updated", { type: "component", id: theirs.id, name: c.name }, {}, true);
            } else {
              const made: ComponentRow = { ...copyComponent(c, target.id), id: newId(), updated_by: me(), inserted_at: at(), updated_at: at() };
              components.insert(made);
              record("created", { type: "component", id: made.id, name: made.name }, { after: { name: made.name } }, true);
            }
          },
        };
      }),
  ];
}

const envVarContent = (v: EnvVarRow) => JSON.stringify({ key: v.key, value: v.value, secret: v.secret, environments: [...v.environments].sort() });

/**
 * A sandbox's environment variables paired with a target's: the one each was
 * copied from, or else one with its key in an environment it's set for (a key
 * is set once in each), and what merging it does.
 */
function envVarPairs(sandbox: ProjectRow, target: ProjectRow) {
  const theirs = envVars.rows().filter((v) => v.project_id === target.id);
  const me = () => {
    const u = findUser(currentUserId());
    return u ? fullName(u) : "Someone";
  };
  return envVars
    .rows()
    .filter((v) => v.project_id === sandbox.id)
    .map((v) => {
      const pair =
        theirs.find((t) => t.id === v.copied_from) ?? theirs.find((t) => t.key === v.key && t.environments.some((e) => v.environments.includes(e)));
      return {
        mine: v,
        theirs: pair,
        same: !!pair && envVarContent(v) === envVarContent(pair),
        apply: () => {
          const at = now();
          if (pair) {
            envVars.update((x) => x.id === pair.id, (x) => ({ ...x, key: v.key, value: v.value, secret: v.secret, environments: v.environments, updated_by: me(), updated_at: at }));
            record("updated", { type: "env_var", id: pair.id, name: v.key }, {}, true);
          } else {
            const made: EnvVarRow = { ...copyEnvVar(v, target.id), id: newId(), copied_from: null, updated_by: me(), inserted_at: at, updated_at: at };
            envVars.insert(made);
            record("created", { type: "env_var", id: made.id, name: made.key }, { after: { key: made.key } }, true);
          }
        },
      };
    });
}

/** Copies a project's components and environment variables into a sandbox just made from it. */
function copyComponentsInto(parentId: string, sandboxId: string, at: string) {
  for (const c of channels.rows().filter((x) => x.project_id === parentId)) channels.insert({ ...copyChannel(c, sandboxId), inserted_at: at, updated_at: at });
  for (const c of collections.rows().filter((x) => x.project_id === parentId)) collections.insert(copyCollection(c, sandboxId, at));
  for (const c of components.rows().filter((x) => x.project_id === parentId)) components.insert(copyComponent(c, sandboxId));
  for (const v of envVars.rows().filter((x) => x.project_id === parentId)) envVars.insert(copyEnvVar(v, sandboxId));
}

/** Merges a sandbox's new and changed components and environment variables into a target. Deletes nothing. */
function mergeComponents(sandbox: ProjectRow, target: ProjectRow) {
  for (const pair of [...componentPairs(sandbox, target), ...envVarPairs(sandbox, target)]) if (!pair.same) pair.apply();
}

/** The target a merge names, or why it can't merge there. */
function targetOf(sandbox: ProjectRow, body: Record<string, unknown>): ProjectRow | Entry {
  const id = (body["target_project_id"] as string | undefined) ?? sandbox.parent_id;
  const target = id ? findProject(id) : undefined;
  const isOwnSandbox = (p: ProjectRow): boolean => (p.parent_id ? p.parent_id === sandbox.id || isOwnSandbox(findProject(p.parent_id)!) : false);
  if (!target || target.id === sandbox.id || isOwnSandbox(target) || target.scheduled_deletion || rootOf(target).id !== rootOf(sandbox).id) {
    return { code: "invalid", detail: "can't merge into that project", pointer: "#/target_project_id" };
  }
  return target;
}

/** The sandbox under a project's URL, after the usual checks; a sandbox of another project counts as missing. */
function sandboxAt(projectId: string, id: string, least: "viewer" | "editor" | "admin" = "viewer"): { parent: ProjectRow; sandbox: ProjectRow } | Response {
  const parent = guardProject(projectId, "viewer");
  if (parent instanceof Response) return parent;
  const sandbox = isUuid(id) ? findProject(id) : undefined;
  if (!sandbox || sandbox.parent_id !== parent.id) return json(404, { type: "about:blank", status: 404, title: "Not Found", code: "not_found", detail: "Not found." });
  const guarded = guardProject(sandbox.id, least);
  if (guarded instanceof Response) return guarded;
  return { parent, sandbox };
}


export const sandboxRoutes: Record<string, Handler> = {
  "GET /api/projects/:project_id/sandboxes": ({ project_id }, _body, query) => {
    const parent = guardProject(project_id!);
    if (parent instanceof Response) return parent;
    const all = query.get("depth") === "all";
    const scheduled = includes(query, "scheduled");
    const under = (id: string): ProjectRow[] => childrenOf(id).flatMap((c) => [c, ...(all ? under(c.id) : [])]);
    const rows = under(parent.id)
      .filter((p) => scheduled || !p.scheduled_deletion)
      .filter((p) => !!roleIn(p.id))
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((p) => projectEntry(p, { list: true, stats: true }));
    return json(200, paged(`/api/projects/${parent.id}/sandboxes`, rows, query));
  },

  // Makes a sandbox under :id, or answers the one already there unchanged.
  "PUT /api/projects/:project_id/sandboxes/:id": ({ project_id, id }, body) => {
    const parent = guardProject(project_id!, "editor");
    if (parent instanceof Response) return parent;
    if (!isUuid(id)) return forbidden();
    const existing = findProject(id);
    if (existing) return existing.parent_id === parent.id ? json(200, { data: projectEntry(existing) }) : conflict("id_taken", "That id belongs to another project.");
    const errors = unknownKeys(body, ["name", "color", "env", "dataclip_ids"]);
    const name = body["name"];
    if (typeof name !== "string" || !name) errors.push({ code: "required", detail: "can't be blank", pointer: "#/name" });
    else if (!NAME.test(name)) errors.push({ code: "format", detail: "has invalid format", pointer: "#/name" });
    else if (childrenOf(parent.id).some((c) => c.name === name && !c.scheduled_deletion)) errors.push({ code: "taken", detail: "has already been taken", pointer: "#/name" });
    if (body["color"] !== undefined && body["color"] !== null && !(typeof body["color"] === "string" && HEX.test(body["color"]))) {
      errors.push({ code: "format", detail: "must be a hex colour like #336699", pointer: "#/color" });
    }
    if (depthOf(parent) + 1 > MAX_DEPTH) errors.push({ code: "invalid", detail: "sandboxes can't be nested any deeper", pointer: "#/name" });
    const clipIds = body["dataclip_ids"];
    if (clipIds !== undefined && !(Array.isArray(clipIds) && clipIds.every((c) => typeof c === "string"))) {
      errors.push({ code: "type", detail: "must be a list of dataclip ids", pointer: "#/dataclip_ids" });
    }
    if (errors.length) return invalid(errors);

    const at = now();
    const sandbox: ProjectRow = {
      ...parent,
      id: id!,
      name: name as string,
      description: null,
      env: typeof body["env"] === "string" && body["env"] ? body["env"] : "staging",
      color: (body["color"] as string | undefined) ?? null,
      parent_id: parent.id,
      scheduled_deletion: null,
      inserted_at: at,
      updated_at: at,
    };
    projects.insert(sandbox);
    // The parent's members come along; its owner becomes an admin, and you the owner.
    for (const m of membersOf(parent.id)) {
      if (m.user_id === currentUserId()) continue;
      members.insert({ ...m, project_id: sandbox.id, role: m.role === "owner" ? "admin" : m.role, inserted_at: at });
    }
    members.insert({ project_id: sandbox.id, user_id: currentUserId(), role: "owner", failure_alert: true, digest: "never", inserted_at: at });
    // Every workflow, with its triggers off.
    const copies = new Map<string, string>();
    for (const w of liveWorkflowsIn(parent.id)) {
      const copy = cloneInto(w, sandbox.id, at);
      workflows.insert(copy);
      snapshot(copy);
      copies.set(w.id, copy.id);
    }
    // The saved dataclips asked for come along, to run the copies with.
    copyDataclipsInto(parent.id, sandbox.id, (clipIds as string[] | undefined) ?? [], copies);
    // Its components and environment variables, as the parent has them now.
    copyComponentsInto(parent.id, sandbox.id, at);
    record("created", { type: "project", id: sandbox.id, name: sandbox.name }, { after: { name: sandbox.name, parent_id: parent.id } });
    return json(201, { data: projectEntry(sandbox) });
  },

  "POST /api/projects/:project_id/sandboxes/:id/merge_previews": ({ project_id, id }, body) => {
    const found = sandboxAt(project_id!, id!);
    if (found instanceof Response) return found;
    const target = targetOf(found.sandbox, body);
    if (!("id" in target)) return invalid([target]);
    return json(200, preview(found.sandbox, target));
  },

  // Copies the chosen workflows (all, by default) into the target as a new version of each.
  "POST /api/projects/:project_id/sandboxes/:id/merges": ({ project_id, id }, body) => {
    const found = sandboxAt(project_id!, id!, "admin");
    if (found instanceof Response) return found;
    const { sandbox } = found;
    const errors = unknownKeys(body, ["target_project_id", "workflow_ids", "message"]);
    const target = targetOf(sandbox, body);
    if (!("id" in target)) errors.push(target);
    else if (!roleIn(target.id) || !["owner", "admin", "editor"].includes(roleIn(target.id)!)) return forbidden();
    const chosen = body["workflow_ids"] as string[] | undefined;
    if (chosen !== undefined && (!Array.isArray(chosen) || chosen.some((w) => !liveWorkflowsIn(sandbox.id).some((x) => x.id === w)))) {
      errors.push({ code: "not_found", detail: "names a workflow that isn't in this sandbox", pointer: "#/workflow_ids" });
    }
    if (errors.length || !("id" in target)) return invalid(errors);
    // The demo's own: what the person said about the change, kept on the new version.
    const message = typeof body["message"] === "string" && body["message"].trim() ? body["message"].trim() : `Merged from ${sandbox.name}`;

    for (const { w, target: t } of pairs(sandbox, target).mine) {
      if (chosen && !chosen.includes(w.id)) continue;
      if (t) {
        const back = mapBack(sandbox, t);
        if (content(w, back) === content(t, (x) => x)) continue;
        const next: WorkflowRow = {
          ...t,
          jobs: w.jobs.map((j) => ({ ...j, id: back(j.id)! })),
          // The target keeps its own trigger switches; the sandbox's are always off.
          triggers: w.triggers.map((tr) => ({ ...tr, id: back(tr.id)!, enabled: t.triggers.find((x) => x.id === back(tr.id))?.enabled ?? false })),
          edges: w.edges.map((e) => ({
            ...e,
            id: back(e.id)!,
            source_trigger_id: back(e.source_trigger_id),
            source_job_id: back(e.source_job_id),
            target_job_id: back(e.target_job_id)!,
          })),
          positions: w.positions && Object.fromEntries(Object.entries(w.positions).map(([k, v]) => [back(k)!, v])),
        };
        const saved = saveWorkflow(t, next, message);
        record("snapshot_created", { type: "workflow", id: saved.id, name: saved.name }, { before: { lock_version: t.lock_version }, after: { lock_version: saved.lock_version } });
      } else {
        // New in the sandbox: made in the target, still off.
        const at = now();
        const created: WorkflowRow = { ...cloneInto(w, target.id, at), id: newId(), copied_from: null };
        workflows.insert(created);
        snapshot(created, message);
        record("created", { type: "workflow", id: created.id, name: created.name }, { after: { name: created.name } });
      }
    }
    // After the workflows, so a new channel finds the target's copy of its workflow.
    mergeComponents(sandbox, target);
    projects.update((p) => p.id === target.id, (p) => ({ ...p, updated_at: now() }));
    return json(201, { data: projectEntry(findProject(target.id)!) });
  },
};
