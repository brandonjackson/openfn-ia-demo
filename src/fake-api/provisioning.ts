/**
 * Exporting a project on the pretend server (api/provisioning.md, Export a
 * project as YAML): the project, its collections and its workflows, in the
 * shape Lightning's YAML export and the CLI use. Any member may export; the
 * id is a query parameter, and errors name it there.
 */
import type { WorkflowDocument } from "../model/workflow-document";
import { isUuid, problem, type Handler } from "./answers";
import { collections } from "./collections";
import { guardProject, isSuperuser } from "./projects";
import { liveWorkflowsIn } from "./workflows";

/** A name as a YAML key: Lightning's export swaps spaces for hyphens. */
const key = (name: string) => name.trim().replace(/\s+/g, "-");

/** A string YAML reads back as itself: plain when it can be, quoted when it can't. */
const scalar = (value: string | null | undefined) =>
  value == null ? "null" : /^[\w./@-][\w ./@-]*$/.test(value) && !/^(true|false|null|yes|no|~)$/i.test(value) ? value : JSON.stringify(value);

/** Lines of text as a literal block, indented under its key. */
const block = (text: string, indent: string) => ["|", ...text.split("\n").map((l) => (l ? indent + l : ""))].join("\n");

function workflowYaml(w: WorkflowDocument): string[] {
  const jobName = (id: string | null) => key(w.jobs.find((j) => j.id === id)?.name ?? "");
  const triggerName = (id: string | null) => w.triggers.find((t) => t.id === id)?.type ?? "";
  const lines = [`  ${key(w.name)}:`, `    name: ${scalar(w.name)}`, "    jobs:"];
  for (const j of w.jobs) {
    lines.push(`      ${key(j.name)}:`, `        name: ${scalar(j.name)}`, `        adaptor: ${scalar(j.adaptor)}`, `        credential: null`);
    lines.push(`        body: ${block(j.body, "          ")}`);
  }
  lines.push("    triggers:");
  for (const t of w.triggers) {
    lines.push(`      ${t.type}:`, `        type: ${t.type}`, `        enabled: ${t.enabled}`);
    if (t.type === "cron") lines.push(`        cron_expression: ${scalar(t.cron_expression)}`);
  }
  lines.push("    edges:");
  for (const e of w.edges) {
    const from = e.source_trigger_id ? triggerName(e.source_trigger_id) : jobName(e.source_job_id);
    const to = jobName(e.target_job_id);
    lines.push(`      ${from}->${to}:`);
    lines.push(e.source_trigger_id ? `        source_trigger: ${from}` : `        source_job: ${from}`);
    lines.push(`        target_job: ${to}`, `        condition_type: ${e.condition_type}`);
    if (e.condition_expression) lines.push(`        condition_expression: ${scalar(e.condition_expression)}`);
    lines.push(`        enabled: ${e.enabled}`);
  }
  return lines;
}

export const provisioningRoutes: Record<string, Handler> = {
  "GET /api/provision/yaml": (_params, _body, query) => {
    const id = query.get("id");
    if (!id)
      return problem({ status: 400, code: "invalid_parameter", detail: "A path or query parameter is not valid. See errors.", errors: [{ code: "required", detail: "is required", parameter: "id" }] });
    // Only a superuser hears that an id isn't a UUID; anyone else is refused as for a project they can't see.
    if (!isUuid(id) && isSuperuser())
      return problem({ status: 400, code: "invalid_parameter", detail: "A path or query parameter is not valid. See errors.", errors: [{ code: "type", detail: "is not a UUID", parameter: "id" }] });
    const p = guardProject(id);
    if (p instanceof Response) return p;
    const own = collections.rows().filter((c) => c.project_id === p.id);
    const yaml = [
      `name: ${scalar(p.name)}`,
      `description: ${p.description ? block(p.description, "  ") : "null"}`,
      ...(own.length ? ["collections:", ...own.flatMap((c) => [`  ${key(c.name)}:`, `    name: ${scalar(c.name)}`])] : []),
      "workflows:",
      ...liveWorkflowsIn(p.id).flatMap(workflowYaml),
    ].join("\n");
    return new Response(`${yaml}\n`, { status: 200, headers: { "content-type": "text/yaml" } });
  },
};
