import { beforeEach, describe, expect, it } from "vitest";
import { forgetCsrfToken, listAll, request } from "../api/client";
import { resetFakeApi, setWait } from ".";
import { apiWorkflowId } from "../fixtures/ids";
import { projectIdFor, sandboxIdFor } from "./projects";

const a = projectIdFor("project-a");

type Named = { id: string; name: string };
type Component = { id: string; attributes: { component_type: string; name: string; content: string; lock_version: number } };
type Var = { id: string; attributes: { key: string; value: string | null; secret: boolean; environments: string[] } };
type Channel = { id: string; name: string; description: string; workflow_id: string | null };
type Line = { name: string; change: string };
type WorkflowLine = Line & { source_workflow_id: string; workflow_name: string };
type Preview = {
  components: { component_type: string; name: string; change: string }[];
  env_vars: { key: string; change: string }[];
  docs: WorkflowLine[];
  test_cases: WorkflowLine[];
  dataclips: Line[];
};
type Doc = { id: string; attributes: { name: string; content: string } };

const channels = (project: string) => listAll<Channel>(`/api/projects/${project}/channels`);
const collections = (project: string) => listAll<Named & { item_count: number }>(`/api/projects/${project}/collections`);
const files = (project: string) => request<{ data: Component[] }>("GET", `/api/demo/projects/${project}/components?page_size=100`).then((r) => r.data);
const vars = (project: string) => request<{ data: Var[] }>("GET", `/api/demo/projects/${project}/env_vars?page_size=100`).then((r) => r.data);
const names = (rows: { name: string }[]) => rows.map((r) => r.name).sort();
const preview = (sandbox: string) => request<Preview>("POST", `/api/projects/${a}/sandboxes/${sandbox}/merge_previews`, {});

beforeEach(() => {
  setWait(0);
  resetFakeApi();
  forgetCsrfToken();
});

async function makeSandbox(name = "try-things") {
  const id = crypto.randomUUID();
  await request("PUT", `/api/projects/${a}/sandboxes/${id}`, { name });
  return id;
}

describe("a sandbox is a copy of its project", () => {
  it("copies the parent's components and environment variables into a new sandbox", async () => {
    const sid = await makeSandbox();

    const theirChannels = await channels(a);
    const mine = await channels(sid);
    expect(names(mine)).toEqual(names(theirChannels));
    expect(mine.every((c) => !theirChannels.some((t) => t.id === c.id))).toBe(true);
    expect(await listAll(`/api/projects/${sid}/channel_requests`)).toEqual([]);

    const theirFiles = await files(a);
    const myFiles = await files(sid);
    expect(myFiles.map((c) => c.attributes.name).sort()).toEqual(theirFiles.map((c) => c.attributes.name).sort());
    expect(myFiles.map((c) => c.attributes.content).sort()).toEqual(theirFiles.map((c) => c.attributes.content).sort());

    const theirVars = await vars(a);
    expect((await vars(sid)).map((v) => v.attributes.key).sort()).toEqual(theirVars.map((v) => v.attributes.key).sort());
  });

  it("copies collections by name only, empty", async () => {
    const sid = await makeSandbox();
    const theirs = await collections(a);
    expect(theirs.some((c) => c.item_count > 0)).toBe(true);
    const mine = await collections(sid);
    expect(names(mine)).toEqual(names(theirs));
    expect(mine.every((c) => c.item_count === 0)).toBe(true);

    // Writing to the sandbox's leaves the parent's alone.
    const name = mine[0]!.name;
    const before = (await collections(a)).find((c) => c.name === name)!.item_count;
    await request("PUT", `/collections/${name}/from-sandbox?project_id=${sid}`, { value: "1" });
    expect((await collections(sid)).find((c) => c.name === name)!.item_count).toBe(1);
    expect((await collections(a)).find((c) => c.name === name)!.item_count).toBe(before);
  });

  it("seeds the fixtures' sandboxes with their own copies", async () => {
    const sid = sandboxIdFor("project-a", "intake-validation-v2");
    expect(names(await channels(sid))).toEqual(names(await channels(a)));
    expect(names(await collections(sid))).toEqual(names(await collections(a)));
    expect((await preview(sid)).components.every((c) => c.change === "unchanged")).toBe(true);
  });

  it("previews and merges new and changed components and variables back, deleting nothing", async () => {
    const sid = await makeSandbox();
    const doc = (await files(sid)).find((c) => c.attributes.component_type === "Document" || c.attributes.component_type === "AI Skill");
    await request("PUT", `/api/demo/projects/${sid}/components/${doc!.id}`, { content: "edited in the sandbox", lock_version: doc!.attributes.lock_version });
    await request("PUT", `/api/demo/projects/${sid}/components/${crypto.randomUUID()}`, { component_type: "Document", name: "runbook", content: "# Runbook" });
    await request("PUT", `/api/projects/${sid}/collections/${crypto.randomUUID()}`, { name: "sandbox-only" });
    await request("POST", `/api/demo/projects/${sid}/env_vars`, { key: "NEW_IN_SANDBOX", value: "1", environments: ["staging"] });
    const [channel] = await channels(sid);
    await request("DELETE", `/api/projects/${sid}/channels/${channel!.id}`);

    const p = await preview(sid);
    const change = (type: string, name: string) => p.components.find((c) => c.component_type === type && c.name === name)?.change;
    expect(change(doc!.attributes.component_type, doc!.attributes.name)).toBe("changed");
    expect(change("Document", "runbook")).toBe("new");
    expect(change("Collection", "sandbox-only")).toBe("new");
    expect(p.env_vars.find((v) => v.key === "NEW_IN_SANDBOX")?.change).toBe("new");
    expect(p.components.filter((c) => c.change !== "unchanged")).toHaveLength(3);

    const workflows = await request<{ workflows: { id: string }[] }>("GET", `/api/projects/${sid}/workflows`);
    await request("POST", `/api/projects/${a}/sandboxes/${sid}/merges`, { workflow_ids: [workflows.workflows[0]!.id] });

    const merged = await files(a);
    const sameFile = (c: Component) => c.attributes.name === doc!.attributes.name && c.attributes.component_type === doc!.attributes.component_type;
    expect(merged.find(sameFile)?.attributes.content).toBe("edited in the sandbox");
    expect(merged.some((c) => c.attributes.name === "runbook")).toBe(true);
    const collectionsNow = await collections(a);
    expect(collectionsNow.find((c) => c.name === "sandbox-only")?.item_count).toBe(0);
    expect((await vars(a)).some((v) => v.attributes.key === "NEW_IN_SANDBOX")).toBe(true);
    // The channel deleted in the sandbox is still on main.
    expect((await channels(a)).some((c) => c.name === channel!.name)).toBe(true);
    // Nothing left to bring.
    expect((await preview(sid)).components.every((c) => c.change === "unchanged")).toBe(true);
  });
});

describe("every file a sandbox keeps is one of its changes", () => {
  const docs = (project: string, workflow: string) =>
    request<{ data: Doc[] }>("GET", `/api/demo/projects/${project}/workflow_docs?workflow_id=${workflow}`).then((r) => r.data);
  const tests = (project: string, workflow: string) =>
    request<{ data: { attributes: { name: string } }[] }>("GET", `/api/demo/projects/${project}/test_cases?workflow_id=${workflow}`).then((r) => r.data);
  const clips = (project: string) => listAll<{ name?: string; body: string }>(`/api/projects/${project}/dataclips`);
  const changed = (lines: Line[]) => lines.filter((l) => l.change !== "unchanged").map((l) => `${l.change} ${l.name}`);

  it("copies a workflow's docs, previews new and changed ones with its tests and saved dataclips, and merges them back", async () => {
    const mainId = apiWorkflowId("apply-national-id");
    const sid = await makeSandbox();
    const { workflows } = await request<{ workflows: Named[] }>("GET", `/api/projects/${sid}/workflows`);
    const { workflows: onMain } = await request<{ workflows: Named[] }>("GET", `/api/projects/${a}/workflows`);
    const copy = workflows.find((w) => w.name === onMain.find((m) => m.id === mainId)!.name)!;

    // A fresh copy changes nothing.
    const myDocs = await docs(sid, copy.id);
    expect(names(myDocs.map((d) => d.attributes))).toEqual(["context.md", "spec.md"]);
    const fresh = await preview(sid);
    expect([...changed(fresh.docs), ...changed(fresh.test_cases), ...changed(fresh.dataclips)]).toEqual([]);

    // Edit spec.md, add a doc, a test and a saved dataclip.
    const spec = myDocs.find((d) => d.attributes.name === "spec.md")!;
    await request("PATCH", `/api/demo/projects/${sid}/workflow_docs/${spec.id}`, { content: "# Spec\n\nEdited in the sandbox." });
    await request("POST", `/api/demo/projects/${sid}/workflow_docs`, { workflow_id: copy.id, name: "untitled.md", content: "" });
    await request("POST", `/api/demo/projects/${sid}/test_cases`, { workflow_id: copy.id, name: "Made in the sandbox", input_description: "An applicant", output_description: "An ID", judge: true });
    await request("POST", `/api/demo/projects/${sid}/dataclips`, { name: "Sandbox input", body: "{}" });

    const p = await preview(sid);
    expect(changed(p.docs).sort()).toEqual(["changed spec.md", "new untitled.md"]);
    expect(p.docs.find((d) => d.name === "untitled.md")).toMatchObject({ source_workflow_id: copy.id, workflow_name: copy.name });
    expect(changed(p.test_cases)).toEqual(["new Made in the sandbox"]);
    expect(changed(p.dataclips)).toEqual(["new Sandbox input"]);

    await request("POST", `/api/projects/${a}/sandboxes/${sid}/merges`, { workflow_ids: [copy.id] });

    const merged = await docs(a, mainId);
    expect(merged.find((d) => d.attributes.name === "spec.md")?.attributes.content).toBe("# Spec\n\nEdited in the sandbox.");
    expect(merged.some((d) => d.attributes.name === "untitled.md")).toBe(true);
    expect((await tests(a, mainId)).some((t) => t.attributes.name === "Made in the sandbox")).toBe(true);
    expect((await clips(a)).some((d) => d.name === "Sandbox input")).toBe(true);
    // Nothing left to bring.
    const after = await preview(sid);
    expect([...changed(after.docs), ...changed(after.test_cases), ...changed(after.dataclips)]).toEqual([]);
  });

  it("seeds the fixtures' sandboxes with their own copies of the docs", async () => {
    const sid = sandboxIdFor("project-a", "intake-validation-v2");
    const p = await preview(sid);
    expect(p.docs.length).toBeGreaterThan(0);
    expect(changed(p.docs)).toEqual([]);
  });
});

describe("a sandbox's environment", () => {
  type One = { data: { attributes: { env: string } } };
  const envOf = (id: string) => request<One>("GET", `/api/projects/${id}`).then((r) => r.data.attributes.env);

  it("is set when the sandbox is made, and can be changed after, unlike a project's", async () => {
    const id = crypto.randomUUID();
    await request("PUT", `/api/projects/${a}/sandboxes/${id}`, { name: "on-mock", env: "mock" });
    expect(await envOf(id)).toBe("mock");

    await request("PUT", `/api/projects/${id}`, { name: "on-mock", env: "production" });
    expect(await envOf(id)).toBe("production");

    const blank = await request("PUT", `/api/projects/${id}`, { name: "on-mock", env: "" }).catch((e: { problems?: { pointer?: string }[] }) => e);
    expect(JSON.stringify(blank)).toContain("#/env");

    const root = await request("PUT", `/api/projects/${a}`, { name: "project-a", env: "mock" }).catch((e: unknown) => e);
    expect(JSON.stringify(root)).toContain("#/env");
    expect(await envOf(a)).not.toBe("mock");
  });
});
