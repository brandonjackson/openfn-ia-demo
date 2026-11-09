import { beforeEach, describe, expect, it } from "vitest";
import { forgetCsrfToken, request, type ApiError } from "../api/client";
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
