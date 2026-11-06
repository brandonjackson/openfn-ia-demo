/**
 * A project's published services on the pretend server. Lightning's API has
 * no services (they're the demo's), so these routes live under `/api/demo/`
 * and follow api/conventions.md.
 *
 * Lifecycle: a service is a workflow published for others to call. Its
 * status is Live or Draft; turning on MCP makes it an agent tool, and
 * publishing it to X-Road offers it to other members under its service
 * code. Both can be undone. Owners and admins of its project change it;
 * anyone in the organisation reads it, and the catalog lists every one.
 */
import { projects as fixtureProjects } from "../fixtures/projects";
import { apiServiceId, apiWorkflowId } from "../fixtures/ids";
import type { ProjectServiceItem } from "../model/services";
import { badId, invalid, isUuid, json, notFound, now, ORIGIN, paged, unknownKeys, type Entry, type Handler } from "./answers";
import { record } from "./audit";
import { seedTime, table } from "./db";
import { findProject, guardProject, projectIdFor } from "./projects";

export interface ServiceRow extends Omit<ProjectServiceItem, "id" | "workflowId"> {
  id: string;
  project_id: string;
  /** Its slug: the end of its address, and its X-Road service code unless it has its own. */
  code: string;
  workflow_id: string | null;
  inserted_at: string;
  updated_at: string;
}

/** A fixture service's id on the API, from its project's slug and its own. */
export const serviceIdFor = apiServiceId;

export const services = table<ServiceRow>("services", () =>
  fixtureProjects.flatMap((p) =>
    p.services.map(({ id, workflowId, ...s }) => ({
      ...s,
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
  attributes: { ...s, id: undefined },
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
  // Live or Draft, MCP on or off, published to X-Road or not.
  "PATCH /api/demo/projects/:project_id/services/:id": ({ project_id, id }, body) => {
    const p = guardProject(project_id!, "admin");
    if (p instanceof Response) return p;
    if (!isUuid(id)) return badId("id");
    const s = services.rows().find((r) => r.id === id && r.project_id === p.id);
    if (!s) return notFound();
    const errors: Entry[] = unknownKeys(body, ["status", "mcpEnabled", "xroad"]);
    if (body["status"] !== undefined && !["Live", "Draft"].includes(body["status"] as string)) errors.push({ code: "invalid", detail: "must be Live or Draft", pointer: "#/status" });
    if (body["mcpEnabled"] !== undefined && typeof body["mcpEnabled"] !== "boolean") errors.push({ code: "type", detail: "must be true or false", pointer: "#/mcpEnabled" });
    const xroad = body["xroad"] as ServiceRow["xroad"] | undefined;
    if (xroad && xroad.published && !/^[A-Za-z0-9._-]+$/.test(xroad.serviceCode ?? s.code)) errors.push({ code: "format", detail: "is not a service code", pointer: "#/xroad/serviceCode" });
    if (errors.length) return invalid(errors);
    const next: ServiceRow = {
      ...s,
      ...(body["status"] !== undefined && { status: body["status"] as ServiceRow["status"] }),
      ...(body["mcpEnabled"] !== undefined && { mcpEnabled: body["mcpEnabled"] as boolean }),
      ...(xroad && { xroad: { ...s.xroad, ...xroad, serviceCode: xroad.serviceCode ?? s.xroad?.serviceCode ?? s.code } }),
      updated_at: now(),
    };
    services.update((r) => r.id === id, () => next);
    record("updated", { type: "service", id: s.id, name: s.name }, { before: { status: s.status, mcpEnabled: s.mcpEnabled ?? false, xroad: s.xroad?.published ?? false }, after: { status: next.status, mcpEnabled: next.mcpEnabled ?? false, xroad: next.xroad?.published ?? false } }, true);
    return json(200, { data: entry(next) });
  },
};
