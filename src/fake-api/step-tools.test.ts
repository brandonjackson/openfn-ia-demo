/*
 * Tools on the pretend server (docs/api-plans/step-tools.md): a run that
 * reaches a Human in the loop step waits until someone answers it, then
 * carries on; a run that reaches a Report outcome step gives its work order
 * an outcome, which lists filter by; and a tool step is saved as a job with
 * a kind and a config.
 */
import { beforeEach, describe, expect, it } from "vitest";
import { forgetCsrfToken, request, type ApiError } from "../api/client";
import { apiWorkflowId } from "../fixtures/ids";
import type { RunDetails } from "../model/workflow";
import type { WorkflowDocument } from "../model/workflow-document";
import { resetFakeApi, setWait, signInAs } from ".";
import { projectIdFor } from "./projects";

const a = projectIdFor("project-a");
const grants = apiWorkflowId("hardship-grant-workflow");
const nationalId = apiWorkflowId("apply-national-id");
const refusal = (p: Promise<unknown>) => p.then(() => undefined, (e: unknown) => e as ApiError);
type Order = { id: string; attributes: { state: string; runs: RunDetails[]; outcome_status: string | null; outcome_description: string | null } };
const orders = (q = "") => request<{ data: Order[] }>("GET", `/api/projects/${a}/work_orders?include=runs&page_size=100${q}`).then((r) => r.data);
const waiting = async () => (await orders(`&workflow_id=${grants}&state=waiting`))[0]!;
const answer = (runId: string, body: Record<string, unknown>) => request<{ data: Order }>("POST", `/api/demo/runs/${runId}/approval`, body).then((r) => r.data);

beforeEach(() => {
  setWait(0);
  resetFakeApi();
  forgetCsrfToken();
});

describe("Human in the loop", () => {
  it("lists runs waiting on someone, with what they're asked", async () => {
    const list = await orders(`&workflow_id=${grants}&state=waiting`);
    expect(list.length).toBe(2);
    const run = list[0]!.attributes.runs[0]!;
    expect(run.status).toBe("waiting");
    expect(run.waitingFor).toMatchObject({ assignee: "District social welfare officer", comment: "required_on_reject" });
    expect(run.waitingFor!.title).toMatch(/^Pay .+ a hardship grant of /);
    expect(run.steps.at(-1)).toMatchObject({ status: "waiting", jobId: run.waitingFor!.jobId });
  });

  it("carries an approved run on to the end, and reports its outcome", async () => {
    const order = await waiting();
    const run = order.attributes.runs[0]!;
    const after = await answer(run.runId, { decision: "approved" });
    expect(after.attributes.state).toBe("success");
    const done = after.attributes.runs[0]!;
    expect(done.runId).toBe(run.runId);
    expect(done.waitingFor).toBeUndefined();
    expect(done.steps.find((s) => s.jobId === run.waitingFor!.jobId)?.answer).toMatchObject({ decision: "approved" });
    expect(done.steps.map((s) => s.label)).toContain("Pay the grant by mobile money");
    expect(after.attributes.outcome_status).toBe("success");
    expect(after.attributes.outcome_description).toMatch(/paid to .+ \(reference MM-\w+\)$/);
    // Answered once, it isn't waiting any more.
    expect((await refusal(answer(run.runId, { decision: "approved" })))?.code).toBe("not_waiting");
  });

  it("asks why before rejecting, when the step says so; a rejected run succeeds with a Refused outcome", async () => {
    const run = (await waiting()).attributes.runs[0]!;
    const bare = await refusal(answer(run.runId, { decision: "rejected" }));
    expect(bare?.fieldError("comment")).toBeTruthy();
    expect((await refusal(answer(run.runId, { decision: "maybe" })))?.fieldError("decision")).toBeTruthy();
    const after = await answer(run.runId, { decision: "rejected", comment: "Had a grant in March" });
    expect(after.attributes.state).toBe("success");
    expect(after.attributes.outcome_status).toBe("refused");
    expect(after.attributes.outcome_description).toMatch(/: Had a grant in March$/);
  });

  it("waits again when a grant is retried, and lets a viewer read but not answer", async () => {
    const order = (await orders(`&workflow_id=${grants}&state=success`))[0]!;
    await request("POST", `/api/projects/${a}/work_orders/retries`, { work_order_ids: [order.id] });
    const retried = (await orders(`&workflow_id=${grants}`)).find((o) => o.id === order.id)!;
    expect(retried.attributes.state).toBe("waiting");
    signInAs("user-beth");
    expect((await refusal(answer(retried.attributes.runs[0]!.runId, { decision: "approved" })))?.code).toBe("forbidden");
  });
});

describe("Report outcome", () => {
  it("gives each work order its latest run's outcome, and filters by it", async () => {
    const refused = await orders(`&workflow_id=${nationalId}&outcome_status=refused`);
    expect(refused.length).toBeGreaterThan(0);
    // An applicant who already holds an ID was refused, though the run went fine.
    expect(refused.every((o) => o.attributes.outcome_status === "refused" && o.attributes.state === "success")).toBe(true);
    expect(refused[0]!.attributes.outcome_description).toMatch(/already holds a national ID$/);
    const issued = await orders(`&workflow_id=${nationalId}&outcome_status=success`);
    expect(issued.length).toBeGreaterThan(0);
    expect(issued[0]!.attributes.outcome_description).toMatch(/^National ID NID-2026-\w+ issued to /);
  });
});

describe("tool steps in a workflow", () => {
  const get = () => request<{ workflow: WorkflowDocument }>("GET", `/api/projects/${a}/workflows/${grants}`).then((r) => r.workflow);

  it("are jobs with a kind and a config, saved and sent back", async () => {
    const w = await get();
    const approval = w.jobs.find((j) => j.kind === "approval")!;
    expect(approval.config).toMatchObject({ assignee: "District social welfare officer", onTimeout: "reject" });
    expect(w.jobs.filter((j) => j.kind === "report_outcome")).toHaveLength(3);
    const jobs = w.jobs.map((j) => (j.id === approval.id ? { ...j, config: { ...j.config, assignee: "Registrar" } } : j));
    const saved = (await request<{ workflow: WorkflowDocument }>("PATCH", `/api/projects/${a}/workflows/${grants}`, { jobs, lock_version: w.lock_version })).workflow;
    expect(saved.jobs.find((j) => j.id === approval.id)?.config).toMatchObject({ assignee: "Registrar" });
  });

  it("refuses a tool without what it needs", async () => {
    const w = await get();
    const jobs = w.jobs.map((j) =>
      j.kind === "approval" ? { ...j, config: { ...j.config, assignee: " " } } : j.kind === "report_outcome" ? { ...j, config: { ...j.config, status: "great" } } : j,
    );
    const bad = await refusal(request("PATCH", `/api/projects/${a}/workflows/${grants}`, { jobs, lock_version: w.lock_version }));
    expect(bad?.errors.map((e) => e.code)).toEqual(expect.arrayContaining(["required", "invalid"]));
    const code = await refusal(
      request("PATCH", `/api/projects/${a}/workflows/${grants}`, { jobs: w.jobs.map((j, i) => (i === 0 ? { ...j, kind: "code", config: { status: "success" } } : j)), lock_version: w.lock_version }),
    );
    expect(code?.errors[0]?.code).toBe("not_allowed");
  });
});
