import { describe, expect, it } from "vitest";
import type { JobNode, Workflow } from "./workflow";
import { componentChanges, workflowChanges } from "./workflow-changes";

const step = (id: string, label: string, x: number, body = "fn(state => state);"): JobNode => ({
  id,
  type: "job",
  label,
  adaptor: "http",
  adaptorPackage: "@openfn/language-http",
  body,
  x,
  y: 0,
});

const base: Workflow = {
  id: "w",
  name: "Intake",
  project: "p",
  version: "v1",
  nodes: [
    { id: "t", type: "trigger", triggerType: "webhook", label: "Webhook trigger", subtitle: "", x: 0, y: 0 },
    step("a", "Fetch cases", 100),
    step("b", "Send SMS", 200),
  ],
  edges: [
    { id: "e1", source: "t", target: "a", condition: "always" },
    { id: "e2", source: "a", target: "b", condition: "on_success" },
  ],
};

// A sandbox's copy: the same content under new ids.
const copy = (w: Workflow): Workflow => ({
  ...w,
  nodes: w.nodes.map((n) => ({ ...n, id: `copy-${n.id}` })),
  edges: w.edges.map((e) => ({ ...e, id: `copy-${e.id}`, source: `copy-${e.source}`, target: `copy-${e.target}` })),
});

describe("workflowChanges", () => {
  it("finds nothing in an untouched copy, whatever its ids", () => {
    expect(workflowChanges(base, copy(base))).toEqual([]);
  });

  it("says a workflow that's only in the sandbox is new", () => {
    expect(workflowChanges(undefined, base)).toEqual([{ kind: "added", summary: "Added the workflow Intake" }]);
  });

  it("names steps added, removed and edited", () => {
    const current = copy(base);
    current.nodes = [
      ...current.nodes.filter((n) => n.id !== "copy-b").map((n) => (n.id === "copy-a" ? { ...n, body: "get('/cases');" } : n)),
      step("c", "Log result", 300),
    ];
    current.edges = [current.edges[0], { id: "e3", source: "copy-a", target: "c", condition: "always" }];

    expect(workflowChanges(base, current).map((c) => c.summary)).toEqual([
      "Changed code in Fetch cases",
      "Added step Log result",
      "Removed step Send SMS",
      "Connected Fetch cases → Log result",
      "Disconnected Fetch cases → Send SMS",
    ]);
  });

  it("follows a renamed step by where it sits, and its connections with it", () => {
    const current = copy(base);
    current.nodes = current.nodes.map((n) => (n.id === "copy-b" ? { ...n, label: "Text the applicant", adaptorPackage: "@openfn/language-twilio" } : n));

    expect(workflowChanges(base, current)).toEqual([
      { kind: "changed", summary: "Renamed Send SMS to Text the applicant" },
      { kind: "changed", summary: "Changed adaptor in Text the applicant" },
    ]);
  });

  it("notices a connection's condition and the trigger's kind", () => {
    const current = copy(base);
    current.nodes = current.nodes.map((n) => (n.type === "trigger" ? { ...n, triggerType: "cron" } : n));
    current.edges = current.edges.map((e) => (e.id === "copy-e2" ? { ...e, condition: "on_failure" } : e));

    expect(workflowChanges(base, current).map((c) => c.summary)).toEqual([
      "Made the trigger a cron trigger",
      "Changed when Fetch cases → Send SMS runs",
    ]);
  });

  it("names components added in the sandbox", () => {
    expect(componentChanges([{ name: "runbook", type: "Document" }, { name: "triage", type: "AI Skill" }])).toEqual([
      { kind: "added", summary: "Added document runbook" },
      { kind: "added", summary: "Added AI skill triage" },
    ]);
  });
});
