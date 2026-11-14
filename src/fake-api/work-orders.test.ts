import { beforeEach, describe, expect, it } from "vitest";
import { forgetCsrfToken, listAll, request, type ApiError } from "../api/client";
import { apiWorkflowId } from "../fixtures/ids";
import type { RunDetails } from "../model/workflow";
import { resetFakeApi, setWait, signInAs } from ".";
import { projectIdFor } from "./projects";

const a = projectIdFor("project-a");
const planning = apiWorkflowId("planning-application-workflow");
const refusal = (p: Promise<unknown>) => p.then(() => undefined, (e: unknown) => e as ApiError);
type Order = { id: string; attributes: { state: string; runs: RunDetails[]; workflow_id: string } };
const orders = (q = "") => request<{ data: Order[]; meta: { total_entries: number } }>("GET", `/api/projects/${a}/work_orders?include=runs&page_size=100${q}`);

beforeEach(() => {
  setWait(0);
  resetFakeApi();
  forgetCsrfToken();
});

describe("work orders and runs", () => {
  it("lists a project's work orders with their runs, filtered by workflow and state", async () => {
    const { data } = await orders(`&workflow_id=${planning}`);
    expect(data.length).toBeGreaterThan(0);
    expect(data.every((o) => o.attributes.workflow_id === planning && o.attributes.runs.length > 0)).toBe(true);
    const failed = await orders("&state=failed");
    expect(failed.data.every((o) => o.attributes.state === "failed")).toBe(true);
  });

  it("retries work orders as a new run on each, newest first", async () => {
    const order = (await orders(`&workflow_id=${planning}`)).data[0]!;
    const answer = await request<{ enqueued: number; discarded: number }>("POST", `/api/projects/${a}/work_orders/retries`, { work_order_ids: [order.id] });
    expect(answer).toEqual({ enqueued: 1, discarded: 0 });
    const after = (await orders(`&workflow_id=${planning}`)).data.find((o) => o.id === order.id)!;
    expect(after.attributes.runs).toHaveLength(order.attributes.runs.length + 1);
    expect(after.attributes.state).toBe(after.attributes.runs[0]!.status);
    const both = await refusal(request("POST", `/api/projects/${a}/work_orders/retries`, { work_order_ids: [order.id], filter: {} }));
    expect(both?.errors[0]?.code).toBe("exclusive");
  });

  it("discards a deleted workflow's work orders when retrying, and its runs refuse", async () => {
    const order = (await orders(`&workflow_id=${planning}`)).data[0]!;
    await request("DELETE", `/api/projects/${a}/workflows/${planning}`);
    expect((await orders(`&workflow_id=${planning}`)).data).toEqual([]);
    const answer = await request<{ enqueued: number; discarded: number }>("POST", `/api/projects/${a}/work_orders/retries`, { work_order_ids: [order.id] });
    expect(answer).toEqual({ enqueued: 0, discarded: 1 });
    expect((await refusal(request("POST", `/api/runs/${order.attributes.runs[0]!.runId}/retries`, {})))?.code).toBe("scheduled_for_deletion");
  });

  it("cancels only runs nobody has picked up yet", async () => {
    const all = (await orders()).data;
    const done = all.find((o) => o.attributes.runs.every((r) => r.status !== "pending"))!;
    expect((await refusal(request("PATCH", `/api/work_orders/${done.id}`, { state: "cancelled" })))?.fieldErrors["state"]).toBeTruthy();
    const waiting = all.find((o) => o.attributes.runs.some((r) => r.status === "pending"));
    if (waiting) {
      const { data } = await request<{ data: { attributes: { state: string } } }>("PATCH", `/api/work_orders/${waiting.id}`, { state: "cancelled" });
      expect(data.attributes.state).toBe("cancelled");
    }
  });

  it("records a run the editor made, as a new work order or another run of one", async () => {
    const order = (await orders(`&workflow_id=${planning}`)).data[0]!;
    const template = order.attributes.runs[0]!;
    const run = { ...template, runId: "feed0001", workOrderId: "feed0000", status: "success" as const };
    await request("POST", `/api/projects/${a}/workflows/${planning}/work_orders`, { run, dataclips: [] });
    expect((await orders(`&workflow_id=${planning}`)).data.some((o) => o.id === "feed0000")).toBe(true);
    await request("POST", `/api/projects/${a}/workflows/${planning}/work_orders`, { run: { ...run, runId: "feed0002" }, work_order_id: "feed0000" });
    expect((await orders(`&workflow_id=${planning}`)).data.find((o) => o.id === "feed0000")!.attributes.runs.map((r) => r.runId)).toEqual(["feed0002", "feed0001"]);
  });

  it("lets a viewer read history but not retry", async () => {
    signInAs("user-beth");
    const order = (await orders()).data[0]!;
    expect((await refusal(request("POST", `/api/projects/${a}/work_orders/retries`, { work_order_ids: [order.id] })))?.code).toBe("forbidden");
  });
});

describe("saved dataclips", () => {
  type Clip = { id: string; name?: string; description?: string; body: string; workflow_id: string | null };
  const clipsIn = (projectId: string) => listAll<Clip>(`/api/projects/${projectId}/dataclips`);

  it("saves an input under a name, and refuses one without a name, a name taken or data that isn't JSON", async () => {
    const { data } = await request<{ data: Clip }>("POST", `/api/demo/projects/${a}/dataclips`, { name: "Late applicant", description: "Applied after the deadline", body: '{"late": true}', workflow_id: planning });
    expect(data).toMatchObject({ name: "Late applicant", description: "Applied after the deadline", workflow_id: planning });
    expect((await clipsIn(a)).some((d) => d.id === data.id)).toBe(true);
    expect((await refusal(request("POST", `/api/demo/projects/${a}/dataclips`, { name: " ", body: "{}" })))?.fieldErrors["name"]).toEqual(["can't be blank"]);
    expect((await refusal(request("POST", `/api/demo/projects/${a}/dataclips`, { name: "late applicant", body: "{}" })))?.fieldErrors["name"]).toEqual(["has already been taken"]);
    expect((await refusal(request("POST", `/api/demo/projects/${a}/dataclips`, { name: "Broken", body: "{" })))?.fieldErrors["body"]).toEqual(["must be JSON"]);
  });

  it("renames and describes a saved one, wherever it's listed", async () => {
    await request("PATCH", `/api/demo/projects/${a}/dataclips/saved-new-citizen`, { name: "First-time applicant", description: "Not in the registry yet" });
    const copies = (await clipsIn(a)).filter((d) => d.id === "saved-new-citizen");
    expect(copies.length).toBeGreaterThan(0);
    expect(copies.every((d) => d.name === "First-time applicant" && d.description === "Not in the registry yet")).toBe(true);
    expect((await refusal(request("PATCH", `/api/demo/projects/${a}/dataclips/saved-new-citizen`, { name: "Sample application: existing citizen" })))?.fieldErrors["name"]).toEqual([
      "has already been taken",
    ]);
    expect((await refusal(request("PATCH", `/api/demo/projects/${a}/dataclips/nope`, { name: "x" })))?.code).toBe("not_found");
  });

  it("brings every saved dataclip into a new sandbox, on its copies of their workflows", async () => {
    const id = crypto.randomUUID();
    const saved = await clipsIn(a);
    await request("PUT", `/api/projects/${a}/sandboxes/${id}`, { name: "try-inputs" });
    const brought = await clipsIn(id);
    const names = (clips: { name?: string | null }[]) => [...new Set(clips.flatMap((d) => (d.name ? [d.name] : [])))].sort();
    expect(names(brought)).toEqual(names(saved));
    const citizen = brought.find((d) => d.name === "Sample application: existing citizen")!;
    expect(citizen.id).not.toBe("saved-existing-citizen");
    const { workflows: copies } = await request<{ workflows: { id: string }[] }>("GET", `/api/projects/${id}/workflows`);
    expect(copies.some((w) => w.id === citizen.workflow_id)).toBe(true);
  });

  it("lets a viewer read saved dataclips but not save one", async () => {
    signInAs("user-beth");
    expect((await clipsIn(a)).length).toBeGreaterThan(0);
    expect((await refusal(request("POST", `/api/demo/projects/${a}/dataclips`, { name: "Mine", body: "{}" })))?.code).toBe("forbidden");
  });
});
