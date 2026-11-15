import { describe, expect, it } from "vitest";
import type { AdaptorInfo } from "./adaptor-reference";
import { ROW_GAP } from "./step-placement";
import type { AdaptorKind, JobNode, TriggerNode, Workflow, WorkflowEdge } from "./workflow";
import { applyEdits, noEdits, withCode, withEdge, withStep, withStepAfter, withStepAtEnd, withTrigger, withoutStep, type NewStep } from "./workflow-edits";
import { toDocument, fromDocument } from "./workflow-document";

const trigger: TriggerNode = { id: "t", type: "trigger", label: "Webhook", triggerType: "webhook", x: 100, y: 0 } as TriggerNode;
const step = (id: string, x: number, y: number): JobNode => ({ id, type: "job", label: id, adaptor: "http", adaptorPackage: "@openfn/language-http", body: "fn(state => state);", x, y });
const edge = (source: string, target: string, condition: WorkflowEdge["condition"] = "on_success"): WorkflowEdge => ({ id: `${source}-${target}`, source, target, condition });
const flow = (nodes: Workflow["nodes"], edges: WorkflowEdge[]): Workflow => ({ id: "w", name: "Intake", project: "p", version: "v1", nodes, edges });
const info = { dhis2: { package: "@openfn/language-dhis2" } } as unknown as Record<AdaptorKind, AdaptorInfo>;
const fresh = (id: string): NewStep => ({ id, type: "job", label: "New step", adaptor: "common", adaptorPackage: "@openfn/language-common", body: "" });
/** Ids handed out in order: "id1", "id2"… */
const ids = () => {
  let n = 0;
  return () => `id${++n}`;
};

// trigger → a → b
const base = flow([trigger, step("a", 100, 170), step("b", 100, 340)], [edge("t", "a", "always"), edge("a", "b")]);
const job = (w: Workflow, id: string) => w.nodes.find((n): n is JobNode => n.type === "job" && n.id === id)!;

describe("withTrigger", () => {
  const webhook: TriggerNode = { id: "t", type: "trigger", label: "Webhook trigger", subtitle: "On each request received", triggerType: "webhook", x: 100, y: 0 };
  const w = flow([webhook, step("a", 100, 170)], [edge("t", "a", "always")]);
  const shownTrigger = (g: Workflow) => g.nodes.find((n): n is TriggerNode => n.type === "trigger")!;

  it("turns a webhook into a cron, every day at midnight, and its card says so", () => {
    const t = shownTrigger(applyEdits(w, withTrigger(noEdits, "t", { triggerType: "cron" }), w.name, info));
    expect(t).toMatchObject({ triggerType: "cron", cronExpression: "0 0 * * *", label: "Cron trigger", subtitle: "Every day at 00:00" });
    expect(t.summary).toBe("**Starts a run** every day at 00:00.");
  });

  it("changes a cron's schedule on top of its kind, and keeps a name it was given", () => {
    const named = flow([{ ...webhook, label: "Nightly sync" }, step("a", 100, 170)], [edge("t", "a", "always")]);
    const e = withTrigger(withTrigger(noEdits, "t", { triggerType: "cron" }), "t", { cronExpression: "30 6 * * 1" });
    expect(shownTrigger(applyEdits(named, e, w.name, info))).toMatchObject({ label: "Nightly sync", cronExpression: "30 6 * * 1", subtitle: "Every Monday at 06:30" });
  });

  it("is saved as the trigger's type and schedule, and read back the same", () => {
    const edited = applyEdits(w, withTrigger(noEdits, "t", { triggerType: "cron", cronExpression: "0 6 * * *" }), w.name, info);
    const doc = toDocument(edited, { triggers: [{ id: "t", type: "webhook", enabled: true, cron_expression: null, custom_path: null, comment: null, webhook_reply: "before_start", webhook_auth_method_ids: ["m"] }] });
    expect(doc.triggers[0]).toMatchObject({ type: "cron", cron_expression: "0 6 * * *", webhook_reply: null, webhook_auth_method_ids: [] });
    const back = fromDocument({ ...doc, id: "w" }, "p");
    expect(shownTrigger(back)).toMatchObject({ triggerType: "cron", cronExpression: "0 6 * * *" });
  });

  it("turns a cron back into a webhook, dropping its schedule", () => {
    const e = withTrigger(withTrigger(noEdits, "t", { triggerType: "cron" }), "t", { triggerType: "webhook" });
    const t = shownTrigger(applyEdits(w, e, w.name, info));
    expect(t).toMatchObject({ triggerType: "webhook", label: "Webhook trigger", subtitle: "On each request received" });
    expect(t.cronExpression).toBeUndefined();
  });
});

describe("applyEdits", () => {
  it("gives the workflow back, renamed, when nothing was edited", () => {
    expect(applyEdits(base, noEdits, "Intake v2", info)).toEqual({ ...base, name: "Intake v2" });
  });

  it("applies a step's new name, adaptor (with its package), credential and code", () => {
    let e = withStep(noEdits, "a", { label: "Fetch cases", adaptor: "dhis2" as AdaptorKind, credentialId: "cred" });
    e = withCode(e, "a", "get('cases');");
    expect(job(applyEdits(base, e, base.name, info), "a")).toMatchObject({ label: "Fetch cases", adaptor: "dhis2", adaptorPackage: "@openfn/language-dhis2", credentialId: "cred", body: "get('cases');" });
    // The other step, and the edits it started from, are untouched.
    expect(job(applyEdits(base, e, base.name, info), "b")).toEqual(job(base, "b"));
    expect(noEdits.labels).toEqual({});
  });

  it("takes a credential or system off when the change names it as undefined, and leaves it when it doesn't", () => {
    const w = flow([trigger, { ...step("a", 100, 170), credentialId: "cred", system: "sys" }], [edge("t", "a", "always")]);
    expect(job(applyEdits(w, withStep(noEdits, "a", { label: "x" }), w.name, info), "a")).toMatchObject({ credentialId: "cred", system: "sys" });
    const off = job(applyEdits(w, withStep(noEdits, "a", { credentialId: undefined, system: undefined }), w.name, info), "a");
    expect(off.credentialId).toBeUndefined();
    expect(off.system).toBeUndefined();
  });

  it("changes a path on top of an earlier change to it", () => {
    const e = withEdge(withEdge(noEdits, "a-b", { condition: "js_expression", expression: "!state.error" }), "a-b", { label: "OK" });
    expect(applyEdits(base, e, base.name, info).edges.find((x) => x.id === "a-b")).toMatchObject({ condition: "js_expression", expression: "!state.error", label: "OK" });
  });

  it("drops a deleted step with every path into and out of it", () => {
    const w = applyEdits(base, withoutStep(noEdits, "a"), base.name, info);
    expect(w.nodes.map((n) => n.id)).toEqual(["t", "b"]);
    expect(w.edges).toEqual([]);
  });

  it("doesn't add a step or path twice once a save has put it in the workflow", () => {
    const e = withStepAtEnd(noEdits, base, fresh("c"), ids())!;
    const saved = applyEdits(base, e, base.name, info);
    expect(applyEdits(saved, e, base.name, info)).toEqual(saved);
  });
});

describe("withStepAtEnd", () => {
  it("puts the step a row under the last one, on a path from it that runs on success", () => {
    const w = applyEdits(base, withStepAtEnd(noEdits, base, fresh("c"), ids()), base.name, info);
    expect(job(w, "c")).toMatchObject({ x: 100, y: 340 + ROW_GAP });
    expect(w.edges.at(-1)).toEqual({ id: "id1", source: "b", target: "c", condition: "on_success" });
  });

  it("adds the first step of a workflow with none, with no path in", () => {
    const empty = flow([trigger], []);
    const w = applyEdits(empty, withStepAtEnd(noEdits, empty, fresh("c"), ids()), empty.name, info);
    expect(w.nodes.map((n) => n.id)).toEqual(["t", "c"]);
    expect(w.edges).toEqual([]);
  });
});

describe("withStepAfter", () => {
  it("puts a step added after the trigger in between, so the trigger keeps one path out and everything below moves down a row", () => {
    const w = applyEdits(base, withStepAfter(noEdits, base, "t", fresh("c"), ids())!, base.name, info);
    // The trigger's one path now leads to the new step, which leads on to where the trigger did.
    expect(w.edges.filter((x) => x.source === "t")).toEqual([{ id: "t-a", source: "t", target: "c", condition: "always" }]);
    expect(w.edges.find((x) => x.source === "c")).toMatchObject({ target: "a", condition: "on_success" });
    // It takes the first step's place; that step and the one below it each move down a row.
    expect(job(w, "c")).toMatchObject({ x: 100, y: 170 });
    expect(job(w, "a").y).toBe(170 + ROW_GAP);
    expect(job(w, "b").y).toBe(340 + ROW_GAP);
  });

  it("starts a trigger with nowhere to go on an always path", () => {
    const empty = flow([trigger], []);
    const w = applyEdits(empty, withStepAfter(noEdits, empty, "t", fresh("c"), ids())!, empty.name, info);
    expect(w.edges).toEqual([{ id: "id1", source: "t", target: "c", condition: "always" }]);
  });

  it("adds a step after a step as another branch from it, on success, keeping the paths already there", () => {
    const w = applyEdits(base, withStepAfter(noEdits, base, "a", fresh("c"), ids())!, base.name, info);
    expect(w.edges.filter((x) => x.source === "a").map((x) => [x.target, x.condition])).toEqual([
      ["b", "on_success"],
      ["c", "on_success"],
    ]);
    expect(job(w, "c").y).toBe(job(w, "b").y);
    expect(job(w, "c").x).not.toBe(job(w, "b").x);
  });

  it("answers nothing for a node that isn't there", () => {
    expect(withStepAfter(noEdits, base, "nope", fresh("c"), ids())).toBeUndefined();
  });
});
