import { beforeEach, describe, expect, it } from "vitest";
import { forgetCsrfToken, listAll, request, type ApiError } from "../api/client";
import { apiWorkflowId } from "../fixtures/ids";
import type { RunDetails } from "../model/workflow";
import { joinTopic, resetFakeApi, setStepTime, setWait, signInAs } from ".";
import { stopRuns } from "./work-orders";
import type { WorkflowDocument } from "../model/workflow-document";
import { projectIdFor } from "./projects";

const a = projectIdFor("project-a");
const planning = apiWorkflowId("planning-application-workflow");
const refusal = (p: Promise<unknown>) => p.then(() => undefined, (e: unknown) => e as ApiError);
type Order = { id: string; attributes: { state: string; runs: RunDetails[]; workflow_id: string } };
const orders = (q = "") => request<{ data: Order[]; meta: { total_entries: number } }>("GET", `/api/projects/${a}/work_orders?include=runs&page_size=100${q}`);

/** Starts a work order by hand on the planning workflow. */
const start = async (body: Record<string, unknown>) => (await request<{ data: Order }>("POST", `/api/projects/${a}/workflows/${planning}/work_orders`, body)).data;
/** The planning workflow's trigger and the job it leads to. */
const planningIds = async () => {
  const { workflow } = await request<{ workflow: WorkflowDocument }>("GET", `/api/projects/${a}/workflows/${planning}`);
  const trigger = workflow.triggers[0]!.id;
  return { trigger, job: workflow.edges.find((e) => e.source_trigger_id === trigger)!.target_job_id };
};

beforeEach(() => {
  setStepTime(700);
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

  it("starts a work order by hand, from the trigger or a job, on a new input or a dataclip", async () => {
    setStepTime(0);
    const { trigger, job } = await planningIds();
    const first = await start({ trigger_id: trigger, body: { name: "Amina" } });
    expect(first.attributes.workflow_id).toBe(planning);
    expect(first.attributes.runs).toHaveLength(1);
    expect(first.attributes.runs[0]!.status).not.toBe("running");
    // Its new input is kept, and a second work order can start from it, at a job.
    const inputId = first.attributes.runs[0]!.inputId;
    const second = await start({ job_id: job, dataclip_id: inputId });
    expect(second.id).not.toBe(first.id);
    expect(second.attributes.runs[0]!.inputId).toBe(inputId);
    expect(second.attributes.runs[0]!.steps[0]!.jobId).toBe(job);
  });

  it("refuses to start one from nowhere, from both, on two inputs or on a dataclip that isn't there", async () => {
    const { trigger, job } = await planningIds();
    expect((await refusal(start({})))?.fieldErrors["job_id"]).toBeTruthy();
    expect((await refusal(start({ trigger_id: trigger, job_id: job })))?.fieldErrors["job_id"]).toBeTruthy();
    expect((await refusal(start({ job_id: "not-a-job" })))?.fieldErrors["job_id"]).toBeTruthy();
    expect((await refusal(start({ trigger_id: trigger, body: {}, dataclip_id: "x" })))?.fieldErrors["dataclip_id"]).toBeTruthy();
    expect((await refusal(start({ trigger_id: trigger, dataclip_id: "nope" })))?.fieldErrors["dataclip_id"]).toBeTruthy();
  });

  it("runs it a step at a time, saved as it goes and announced on the run's topic", async () => {
    setStepTime(15);
    const { trigger } = await planningIds();
    const heard: string[] = [];
    const leaveHistory = joinTopic(`workflow:${planning}`, (event) => heard.push(event));
    const started = await start({ trigger_id: trigger });
    const run = started.attributes.runs[0]!;
    // Answered while it's still going: the first step running, the rest to come.
    expect(run.status).toBe("running");
    expect(run.steps[0]!.status).toBe("running");
    const leave = joinTopic(`run:${run.runId}`, (event) => heard.push(event));
    const now = async () => (await orders(`&workflow_id=${planning}`)).data.find((o) => o.id === started.id)!;
    await expect.poll(async () => (await now()).attributes.runs[0]!.status, { timeout: 5000 }).not.toBe("running");
    leave();
    leaveHistory();
    const done = (await now()).attributes;
    expect(done.state).toBe(done.runs[0]!.status);
    expect(done.runs[0]!.steps.every((s) => s.status !== "running" && s.status !== "pending")).toBe(true);
    expect(heard[0]).toBe("history_updated");
    expect(heard).toContain("step:started");
    expect(heard).toContain("step:completed");
    expect(heard.at(-1)).toBe("run:updated");
  });

  it("retries one run as another run of its work order, from a step or from the start", async () => {
    setStepTime(0);
    const { trigger } = await planningIds();
    const started = await start({ trigger_id: trigger });
    const run = started.attributes.runs[0]!;
    const again = await request<{ data: { id: string } }>("POST", `/api/runs/${run.runId}/retries`, {});
    const fromStep = await request<{ data: { id: string } }>("POST", `/api/runs/${run.runId}/retries`, { step_id: run.steps[1]!.id });
    const order = (await orders(`&workflow_id=${planning}`)).data.find((o) => o.id === started.id)!;
    expect(order.attributes.runs.map((r) => r.runId)).toEqual([fromStep.data.id, again.data.id, run.runId]);
    expect(order.attributes.runs[0]!.steps[0]!.jobId).toBe(run.steps[1]!.jobId);
    expect((await refusal(request("POST", `/api/runs/${run.runId}/retries`, { step_id: "nope" })))?.fieldErrors["step_id"]).toBeTruthy();
  });

  it("fails a run nobody is running any more, as after a reload part-way through", async () => {
    setStepTime(10_000);
    const { trigger } = await planningIds();
    const started = await start({ trigger_id: trigger });
    // The worker goes away, as when the page is closed; the data stays.
    stopRuns();
    const order = (await orders(`&workflow_id=${planning}`)).data.find((o) => o.id === started.id)!;
    expect(order.attributes.state).toBe("failed");
    expect(order.attributes.runs[0]!.steps.every((s) => s.status === "cancelled")).toBe(true);
    expect(order.attributes.runs[0]!.logs.at(-1)!.message).toMatch(/Run lost/);
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
