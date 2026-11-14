import { beforeEach, describe, expect, it } from "vitest";
import { forgetCsrfToken, request, type ApiError } from "../api/client";
import { apiWorkflowId } from "../fixtures/ids";
import type { WorkflowDocument } from "../model/workflow-document";
import { resetFakeApi, setWait, signInAs } from ".";
import { projectIdFor, sandboxIdFor } from "./projects";

const a = projectIdFor("project-a");
const planning = apiWorkflowId("planning-application-workflow");
const refusal = (p: Promise<unknown>) => p.then(() => undefined, (e: unknown) => e as ApiError);
const get = (id: string, project = a) => request<{ workflow: WorkflowDocument }>("GET", `/api/projects/${project}/workflows/${id}`).then((r) => r.workflow);
const list = (project = a) => request<{ workflows: WorkflowDocument[] }>("GET", `/api/projects/${project}/workflows`).then((r) => r.workflows);

const starter = {
  name: "Birth notifications",
  jobs: [{ id: "first", name: "Send to registry", body: "fn(s => s)", adaptor: "@openfn/language-http@latest" }],
  triggers: [{ id: "t", type: "webhook", enabled: true }],
  edges: [{ id: "e", source_trigger_id: "t", target_job_id: "first", condition_type: "always" }],
  positions: { t: { x: 0, y: 0 }, first: { x: 0, y: 160 } },
};

beforeEach(() => {
  setWait(0);
  resetFakeApi();
  forgetCsrfToken();
});

describe("workflows", () => {
  it("lists a project's seeded workflows, each with UUIDs throughout", async () => {
    const all = await list();
    expect(all.map((w) => w.name)).toContain("planning-application-workflow");
    const w = all.find((x) => x.id === planning)!;
    expect(w.jobs.every((j) => /^[0-9a-f-]{36}$/.test(j.id))).toBe(true);
  });

  it("creates a workflow with fresh ids, and refuses a name that's taken", async () => {
    const { workflow } = await request<{ workflow: WorkflowDocument }>("POST", `/api/projects/${a}/workflows`, starter);
    expect(workflow.jobs[0]!.id).not.toBe("first");
    expect(workflow.edges[0]!.target_job_id).toBe(workflow.jobs[0]!.id);
    expect((await list()).some((w) => w.id === workflow.id)).toBe(true);
    const again = await refusal(request("POST", `/api/projects/${a}/workflows`, starter));
    expect(again?.fieldErrors["name"]).toEqual(["has already been taken"]);
  });

  it("refuses a graph that doesn't hold together, all at once", async () => {
    const bad = await refusal(
      request("POST", `/api/projects/${a}/workflows`, {
        ...starter,
        name: "Loops",
        jobs: [...starter.jobs, { id: "second", name: "Two", body: "", adaptor: "@openfn/language-common@latest" }],
        triggers: [
          { id: "t", type: "webhook", enabled: true },
          { id: "t2", type: "cron", enabled: true, cron_expression: "0 * * * *" },
        ],
        edges: [
          { id: "e", source_trigger_id: "t", target_job_id: "first", condition_type: "on_job_success" },
          { id: "e2", source_job_id: "first", target_job_id: "second" },
          { id: "e3", source_job_id: "second", target_job_id: "first" },
        ],
      }),
    );
    expect(bad?.errors.map((e) => e.code).sort()).toEqual(["cycle", "invalid", "one_enabled"]);
  });

  it("saves a change as a new version, and refuses a stale one", async () => {
    const before = await get(planning);
    const jobs = before.jobs.map((j, i) => (i === 0 ? { ...j, body: "fn(state => state) // edited" } : j));
    const after = (await request<{ workflow: WorkflowDocument }>("PATCH", `/api/projects/${a}/workflows/${planning}`, { jobs, lock_version: before.lock_version })).workflow;
    expect(after.lock_version).toBe(before.lock_version + 1);
    const stale = await refusal(request("PATCH", `/api/projects/${a}/workflows/${planning}`, { name: "x", lock_version: before.lock_version }));
    expect(stale?.code).toBe("concurrent_edit");
    const { data } = await request<{ data: { lock_version: number; latest: boolean }[] }>("GET", `/api/workflows/${planning}/snapshots`);
    expect(data[0]).toMatchObject({ lock_version: after.lock_version, latest: true });
  });

  it("turns a workflow off and on through its trigger, but never drops the trigger", async () => {
    const w = await get(planning);
    const off = (await request<{ workflow: WorkflowDocument }>("PATCH", `/api/projects/${a}/workflows/${planning}`, { triggers: w.triggers.map((t) => ({ ...t, enabled: false })) })).workflow;
    expect(off.triggers.every((t) => !t.enabled)).toBe(true);
    // Switching it isn't a new version.
    expect(off.lock_version).toBe(w.lock_version);
    const dropped = await refusal(request("PATCH", `/api/projects/${a}/workflows/${planning}`, { triggers: [] }));
    expect(dropped?.errors.map((e) => e.code)).toContain("trigger_removed");
  });

  it("marks a workflow deleted: gone from the list and its GET, triggers off", async () => {
    await request("DELETE", `/api/projects/${a}/workflows/${planning}`);
    expect((await list()).some((w) => w.id === planning)).toBe(false);
    expect((await refusal(get(planning)))?.code).toBe("not_found");
    expect((await refusal(request("DELETE", `/api/projects/${a}/workflows/${planning}`)))?.code).toBe("not_found");
  });

  it("lets a viewer read but not change", async () => {
    // Beth is a viewer in project-a.
    signInAs("user-beth");
    expect((await list()).length).toBeGreaterThan(0);
    expect((await refusal(request("PATCH", `/api/projects/${a}/workflows/${planning}`, { name: "x" })))?.code).toBe("forbidden");
    expect((await refusal(request("DELETE", `/api/projects/${a}/workflows/${planning}`)))?.code).toBe("forbidden");
  });
});

describe("sandboxes", () => {
  it("seeds the fixtures' sandboxes as child projects with their own copies", async () => {
    const { data } = await request<{ data: { id: string; attributes: { name: string; parent_id: string } }[] }>("GET", `/api/projects/${a}/sandboxes`);
    expect(data.map((s) => s.attributes.name).sort()).toEqual(["decision-sync-fix", "intake-validation-v2"]);
    const copies = await list(sandboxIdFor("project-a", "intake-validation-v2"));
    expect(copies.length).toBe((await list()).length);
    expect(copies.every((w) => w.triggers.every((t) => !t.enabled))).toBe(true);
  });

  it("makes a sandbox: workflows copied with triggers off, you its owner", async () => {
    const id = crypto.randomUUID();
    await request("PUT", `/api/projects/${a}/sandboxes/${id}`, { name: "try-things", color: "#22c55e" });
    const copies = await list(id);
    expect(copies.map((w) => w.name).sort()).toEqual((await list()).map((w) => w.name).sort());
    expect(copies.flatMap((w) => w.triggers).every((t) => !t.enabled)).toBe(true);
    const taken = await refusal(request("PUT", `/api/projects/${a}/sandboxes/${crypto.randomUUID()}`, { name: "try-things" }));
    expect(taken?.fieldErrors["name"]).toEqual(["has already been taken"]);
  });

  it("previews and merges a change back into main as a new version", async () => {
    const sid = crypto.randomUUID();
    await request("PUT", `/api/projects/${a}/sandboxes/${sid}`, { name: "fix-routing" });
    const copy = (await list(sid)).find((w) => w.name === "planning-application-workflow")!;
    await request("PATCH", `/api/projects/${sid}/workflows/${copy.id}`, { jobs: copy.jobs.map((j, i) => (i === 0 ? { ...j, body: "fn(s => s) // fixed" } : j)) });

    const before = await get(planning);
    const preview = await request<{ workflows: { name: string; change: string }[] }>("POST", `/api/projects/${a}/sandboxes/${sid}/merge_previews`, {});
    expect(preview.workflows.find((w) => w.name === "planning-application-workflow")?.change).toBe("changed");
    expect(preview.workflows.filter((w) => w.change === "changed")).toHaveLength(1);

    await request("POST", `/api/projects/${a}/sandboxes/${sid}/merges`, { workflow_ids: [copy.id], message: "Fix routing" });
    const after = await get(planning);
    expect(after.lock_version).toBe(before.lock_version + 1);
    expect(after.jobs[0]!.body).toBe("fn(s => s) // fixed");
    // Main keeps its own ids and its trigger stays on.
    expect(after.jobs.map((j) => j.id)).toEqual(before.jobs.map((j) => j.id));
    expect(after.triggers[0]!.enabled).toBe(before.triggers[0]!.enabled);
    const { data } = await request<{ data: { message: string }[] }>("GET", `/api/workflows/${planning}/snapshots`);
    expect(data[0]!.message).toBe("Fix routing");
  });

  it("lists the merge's version first in main's history, numbered by its lock version, with the promotion's message", async () => {
    const before = await request<{ data: { lock_version: number }[] }>("GET", `/api/workflows/${planning}/snapshots`);
    const sid = crypto.randomUUID();
    await request("PUT", `/api/projects/${a}/sandboxes/${sid}`, { name: "dedupe" });
    const copy = (await list(sid)).find((w) => w.name === "planning-application-workflow")!;
    await request("PATCH", `/api/projects/${sid}/workflows/${copy.id}`, { jobs: copy.jobs.map((j, i) => (i === 0 ? { ...j, body: "fn(s => s) // dedupe" } : j)) });
    await request("POST", `/api/projects/${a}/sandboxes/${sid}/merges`, { workflow_ids: [copy.id], message: "Adds a duplicate check" });

    const after = await get(planning);
    const { data } = await request<{ data: { lock_version: number; latest: boolean; message: string; author: string }[] }>("GET", `/api/workflows/${planning}/snapshots`);
    expect(data).toHaveLength(before.data.length + 1);
    expect(data[0]).toMatchObject({ lock_version: after.lock_version, latest: true, message: "Adds a duplicate check" });
    expect(data[0]!.author).not.toBe("Unknown");
    expect(data.slice(1).every((s) => !s.latest)).toBe(true);
  });

  it("names a merge's version after its sandbox when nothing was said about it", async () => {
    const sid = crypto.randomUUID();
    await request("PUT", `/api/projects/${a}/sandboxes/${sid}`, { name: "quiet-fix" });
    const copy = (await list(sid)).find((w) => w.name === "planning-application-workflow")!;
    await request("PATCH", `/api/projects/${sid}/workflows/${copy.id}`, { jobs: copy.jobs.map((j, i) => (i === 0 ? { ...j, body: "fn(s => s) // quiet" } : j)) });
    await request("POST", `/api/projects/${a}/sandboxes/${sid}/merges`, { workflow_ids: [copy.id] });
    const { data } = await request<{ data: { message: string }[] }>("GET", `/api/workflows/${planning}/snapshots`);
    expect(data[0]!.message).toBe("Merged from quiet-fix");
  });

  it("deletes a sandbox with the sandboxes made from it", async () => {
    const parent = crypto.randomUUID();
    const child = crypto.randomUUID();
    await request("PUT", `/api/projects/${a}/sandboxes/${parent}`, { name: "outer" });
    await request("PUT", `/api/projects/${parent}/sandboxes/${child}`, { name: "inner" });
    await request("DELETE", `/api/projects/${parent}`);
    expect((await refusal(request("GET", `/api/projects/${child}`)))?.code).toBe("scheduled_for_deletion");
  });
});
