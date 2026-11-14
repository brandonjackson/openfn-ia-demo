import { describe, expect, it } from "vitest";
import type { JobNode, Workflow } from "./workflow";
import { componentChanges, counterpartNodeId, workflowChanges } from "./workflow-changes";

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

  it("says a workflow that's only in the sandbox is new, with each of its steps", () => {
    expect(workflowChanges(undefined, base)).toEqual([
      { kind: "added", summary: "Added the workflow Intake" },
      { kind: "added", summary: "Added step Fetch cases" },
      { kind: "added", summary: "Added step Send SMS" },
    ]);
  });

  it("counts one more change when a step is added to a new workflow", () => {
    // Given a new workflow (a trigger and its first step), when a step is added, the count goes up.
    const started: Workflow = { ...base, nodes: base.nodes.slice(0, 2), edges: base.edges.slice(0, 1) };
    const before = workflowChanges(undefined, started).length;
    const after = workflowChanges(undefined, { ...started, nodes: [...started.nodes, step("n", "Untitled step", 200)] }).length;
    expect(after).toBe(before + 1);
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

  it("names components and environment variables added or changed in the sandbox", () => {
    expect(
      componentChanges([
        { name: "runbook", type: "Document", change: "new" },
        { name: "triage", type: "AI Skill", change: "changed" },
        { name: "DHIS2_URL", type: "Environment variable", change: "new" },
      ]),
    ).toEqual([
      { kind: "added", summary: "Added document runbook" },
      { kind: "changed", summary: "Changed AI skill triage" },
      { kind: "added", summary: "Added environment variable DHIS2_URL" },
    ]);
  });
});

describe("counterpartNodeId", () => {
  it("finds the same step in another copy by name, and the trigger as the trigger", () => {
    const other = copy(base);
    expect(counterpartNodeId(base, other, "b")).toBe("copy-b");
    expect(counterpartNodeId(base, other, "t")).toBe("copy-t");
    expect(counterpartNodeId(other, base, "copy-a")).toBe("a");
  });

  it("finds nothing for a step the other copy doesn't have", () => {
    const other = copy(base);
    other.nodes = other.nodes.filter((n) => n.id !== "copy-b");
    expect(counterpartNodeId(base, other, "b")).toBeUndefined();
  });
});
