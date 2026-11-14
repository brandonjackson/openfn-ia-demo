/**
 * A project's published services on the pretend server. Lightning's API has
 * no services (they're the demo's), so these routes live under `/api/demo/`
 * and follow api/conventions.md.
 *
 * Lifecycle: a service is a workflow published for others to call. A
 * workflow with a service listing is published: there's no draft. Publishing
 * one (`POST …/services`) gives it a listing with a name, a description and a
 * code (the end of its address, from its name, unique in the project); a
 * workflow is published once at most (409 `already_published`). Its listing's
 * name and description can be edited; turning on MCP makes it an agent tool,
 * and publishing it to X-Road offers it to other members under its service
 * code. Both can be undone. Owners and admins of its project change it;
 * anyone in the organisation reads it, and the catalog lists every one,
 * under its `section` (who offers it) and, with MCP on, as its `mcp_tool_name`.
 */
import { projects as fixtureProjects } from "../fixtures/projects";
import { serviceCatalogData } from "../fixtures/service-catalog";
import { apiServiceId, apiWorkflowId, newId } from "../fixtures/ids";
import type { ProjectServiceItem } from "../model/services";
import { badId, conflict, invalid, isUuid, json, notFound, now, ORIGIN, paged, unknownKeys, type Entry, type Handler } from "./answers";
import { record } from "./audit";
import { seedTime, table } from "./db";
import { findProject, guardProject, projectIdFor } from "./projects";
import { findWorkflow } from "./workflows";

export interface ServiceRow extends Omit<ProjectServiceItem, "id" | "workflowId"> {
  id: string;
  project_id: string;
  /** Its slug: the end of its address, and its X-Road service code unless it has its own. */
  code: string;
  workflow_id: string | null;
  /** Where the catalog files it: the part of the organisation that offers it. */
  section: string | null;
  /** The tool's name on the organisation's MCP server. */
  mcp_tool_name: string;
  inserted_at: string;
  updated_at: string;
}

/** A fixture service's id on the API, from its project's slug and its own. */
export const serviceIdFor = apiServiceId;

/** How the catalog fixture files a project's service: its section and tool name, by `projectSlug/code`. */
const listed = new Map(
  serviceCatalogData.entries.flatMap((e) => {
    if (e.kind !== "workflow" || !e.projectPath) return [];
    const [, , slug, , code] = e.projectPath.split("/");
    return [[`${slug}/${code}`, { section: e.section, mcpToolName: e.mcpToolName }] as const];
  }),
);

export const services = table<ServiceRow>("services", () =>
  fixtureProjects.flatMap((p) =>
    p.services.map(({ id, workflowId, ...s }) => ({
      ...s,
      section: listed.get(`${p.id}/${id}`)?.section ?? null,
      mcp_tool_name: listed.get(`${p.id}/${id}`)?.mcpToolName ?? id.replace(/-/g, "_"),
      id: serviceIdFor(p.id, id),
      project_id: projectIdFor(p.id),
      code: id,
      workflow_id: workflowId ? apiWorkflowId(workflowId) : null,
      inserted_at: seedTime("1 Jun 2026"),
      updated_at: seedTime("1 Jun 2026"),
    })),
  ),
);

const entry = (s: ServiceRow) => ({
  type: "services",
  id: s.id,
  // The project's name rides along, so the catalog can name a project you're not in.
  attributes: { ...s, id: undefined, project_name: findProject(s.project_id)?.name ?? null },
  relationships: {},
  links: { self: `${ORIGIN}/api/demo/projects/${s.project_id}/services/${s.id}` },
});

export const serviceRoutes: Record<string, Handler> = {
  // Every service in every project you can see: the organisation's catalog.
  "GET /api/demo/services": (_params, _body, query) => {
    const rows = services
      .rows()
      .filter((s) => !findProject(s.project_id)?.scheduled_deletion)
      .sort((a, b) => a.name.localeCompare(b.name))
      .map(entry);
    return json(200, paged("/api/demo/services", rows, query));
  },
  "GET /api/demo/projects/:project_id/services": ({ project_id }, _body, query) => {
    const p = guardProject(project_id!);
    if (p instanceof Response) return p;
    return json(200, paged(`/api/demo/projects/${p.id}/services`, services.rows().filter((s) => s.project_id === p.id).map(entry), query));
  },
  "GET /api/demo/projects/:project_id/services/:id": ({ project_id, id }) => {
    const p = guardProject(project_id!);
    if (p instanceof Response) return p;
    if (!isUuid(id)) return badId("id");
    const s = services.rows().find((r) => r.id === id && r.project_id === p.id);
    return s ? json(200, { data: entry(s) }) : notFound();
  },
  // Publishes a workflow as a service: its listing, under a code made from its name.
  "POST /api/demo/projects/:project_id/services": ({ project_id }, body) => {
    const p = guardProject(project_id!, "admin");
    if (p instanceof Response) return p;
    const errors: Entry[] = unknownKeys(body, ["workflow_id", "name", "description"]);
    const workflowId = body["workflow_id"];
    const workflow = typeof workflowId === "string" && isUuid(workflowId) ? findWorkflow(workflowId) : undefined;
    if (!workflow || workflow.project_id !== p.id) errors.push({ code: "not_found", detail: "isn't a workflow in this project", pointer: "#/workflow_id" });
    const name = typeof body["name"] === "string" ? body["name"].trim() : "";
    if (!name) errors.push({ code: "required", detail: "can't be blank", pointer: "#/name" });
    else if (name.length > 120) errors.push({ code: "length", detail: "should be at most 120 characters", pointer: "#/name" });
    if (body["description"] !== undefined && typeof body["description"] !== "string") errors.push({ code: "type", detail: "must be text", pointer: "#/description" });
    if (errors.length) return invalid(errors);
    if (services.rows().some((r) => r.workflow_id === workflow!.id)) return conflict("already_published", "This workflow is already published as a service.");
    const base = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "service";
    const codes = new Set(services.rows().filter((r) => r.project_id === p.id).map((r) => r.code));
    let code = base;
    for (let i = 2; codes.has(code); i++) code = `${base}-${i}`;
    const at = now();
    const made: ServiceRow = {
      id: newId(),
      project_id: p.id,
      name,
      description: ((body["description"] as string | undefined) ?? "").trim(),
      code,
      workflow_id: workflow!.id,
      section: null,
      mcp_tool_name: code.replace(/-/g, "_"),
      inserted_at: at,
      updated_at: at,
    };
    services.insert(made);
    record("created", { type: "service", id: made.id, name }, { after: { name, workflow_id: workflow!.id } });
    return json(201, { data: entry(made) });
  },
  // Its listing's name and description, MCP on or off, published to X-Road or not.
  "PATCH /api/demo/projects/:project_id/services/:id": ({ project_id, id }, body) => {
    const p = guardProject(project_id!, "admin");
    if (p instanceof Response) return p;
    if (!isUuid(id)) return badId("id");
    const s = services.rows().find((r) => r.id === id && r.project_id === p.id);
    if (!s) return notFound();
    const errors: Entry[] = unknownKeys(body, ["name", "description", "mcpEnabled", "xroad"]);
    if (body["name"] !== undefined && (typeof body["name"] !== "string" || !body["name"].trim())) errors.push({ code: "required", detail: "can't be blank", pointer: "#/name" });
    else if (typeof body["name"] === "string" && body["name"].trim().length > 120) errors.push({ code: "length", detail: "should be at most 120 characters", pointer: "#/name" });
    if (body["description"] !== undefined && typeof body["description"] !== "string") errors.push({ code: "type", detail: "must be text", pointer: "#/description" });
    if (body["mcpEnabled"] !== undefined && typeof body["mcpEnabled"] !== "boolean") errors.push({ code: "type", detail: "must be true or false", pointer: "#/mcpEnabled" });
    const xroad = body["xroad"] as ServiceRow["xroad"] | undefined;
    if (xroad && xroad.published && !/^[A-Za-z0-9._-]+$/.test(xroad.serviceCode ?? s.code)) errors.push({ code: "format", detail: "is not a service code", pointer: "#/xroad/serviceCode" });
    if (errors.length) return invalid(errors);
    const next: ServiceRow = {
      ...s,
      ...(typeof body["name"] === "string" && { name: body["name"].trim() }),
      ...(typeof body["description"] === "string" && { description: body["description"].trim() }),
      ...(body["mcpEnabled"] !== undefined && { mcpEnabled: body["mcpEnabled"] as boolean }),
      ...(xroad && { xroad: { ...s.xroad, ...xroad, serviceCode: xroad.serviceCode ?? s.xroad?.serviceCode ?? s.code } }),
      updated_at: now(),
    };
    services.update((r) => r.id === id, () => next);
    const facts = (r: ServiceRow) => ({ name: r.name, description: r.description, mcpEnabled: r.mcpEnabled ?? false, xroad: r.xroad?.published ?? false });
    record("updated", { type: "service", id: s.id, name: next.name }, { before: facts(s), after: facts(next) }, true);
    return json(200, { data: entry(next) });
  },
};
