import { beforeEach, describe, expect, it } from "vitest";
import { forgetCsrfToken, request, type ApiError } from "../api/client";
import type { WorkflowDocument } from "../model/workflow-document";
import { resetFakeApi, setWait, signInAs } from ".";
import { projectIdFor, sandboxIdFor } from "./projects";

const refusal = (p: Promise<unknown>) => p.then(() => undefined, (e: unknown) => e as ApiError);
type Row = { id: string; attributes: Record<string, unknown> };
const others = () => request<{ data: Row[] }>("GET", "/api/demo/projects/others?page_size=100").then((r) => r.data);
const workflowsIn = (id: string) => request<{ workflows: WorkflowDocument[] }>("GET", `/api/projects/${id}/workflows`).then((r) => r.workflows);

const a = projectIdFor("project-a");
const registry = projectIdFor("immunization-registry");

beforeEach(() => {
  setWait(0);
  resetFakeApi();
  forgetCsrfToken();
});

describe("other projects", () => {
  it("lists the top-level projects you aren't in, with their owner and size", async () => {
    const rows = await others();
    expect(rows.map((r) => r.attributes["name"])).toEqual(["immunization-registry", "school-enrolment"]);
    expect(rows[0]!.attributes).toMatchObject({ owner_name: "Priya Nair", member_count: 2, join_requested: false });
    // Someone else sees a different list: Beth isn't in malawi-chw-referrals.
    signInAs("user-beth");
    expect((await others()).map((r) => r.attributes["name"])).toContain("malawi-chw-referrals");
  });

  it("records a request to join once, refuses one from a member, and keeps the project closed", async () => {
    const path = `/api/demo/projects/${registry}/join_requests`;
    const first = await request<{ data: Row }>("POST", path, {});
    const again = await request<{ data: Row }>("POST", path, {});
    expect(again.data.id).toBe(first.data.id);
    expect((await others()).find((r) => r.id === registry)?.attributes["join_requested"]).toBe(true);
    // Asking doesn't let you in.
    expect((await refusal(request("GET", `/api/projects/${registry}`)))?.status).toBe(403);
    expect((await refusal(request("POST", `/api/demo/projects/${a}/join_requests`, {})))?.code).toBe("already_member");
  });
});

describe("project copies", () => {
  it("copies a project with its workflows paused, you its only member and owner, under a name of its own", async () => {
    const original = await workflowsIn(a);
    const { data } = await request<{ data: Row }>("POST", `/api/demo/projects/${a}/copies`, {});
    expect(data.attributes["name"]).toBe("project-a-copy");
    const copied = await workflowsIn(data.id);
    expect(copied.map((w) => w.name).sort()).toEqual(original.map((w) => w.name).sort());
    expect(copied.every((w) => w.triggers.every((t) => !t.enabled))).toBe(true);
    expect(copied.some((w) => original.some((o) => o.id === w.id))).toBe(false);
    const members = await request<{ data: Row[] }>("GET", `/api/projects/${data.id}/members`);
    expect(members.data.map((m) => m.attributes["role"])).toEqual(["owner"]);
    // Its channels come along, and the original is untouched.
    const channels = (id: string) => request<{ data: Row[] }>("GET", `/api/projects/${id}/channels?page_size=100`).then((r) => r.data.length);
    expect(await channels(data.id)).toBe(await channels(a));
    expect((await workflowsIn(a)).filter((w) => w.triggers.some((t) => t.enabled)).length).toBeGreaterThan(0);
    // A second copy gets the next name.
    expect((await request<{ data: Row }>("POST", `/api/demo/projects/${a}/copies`, {})).data.attributes["name"]).toBe("project-a-copy-2");
  });

  it("refuses to copy a project you aren't in, or a sandbox", async () => {
    expect((await refusal(request("POST", `/api/demo/projects/${registry}/copies`, {})))?.status).toBe(403);
    expect((await refusal(request("POST", `/api/demo/projects/${sandboxIdFor("project-a", "intake-validation-v2")}/copies`, {})))?.status).toBe(422);
  });
});
