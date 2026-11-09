import { describe, expect, it } from "vitest";
import type { JobNode, Workflow } from "./workflow";
import { stepDeleteBlockedReason } from "./workflow";

const step = (id: string): JobNode => ({
  id,
  type: "job",
  label: id,
  adaptor: "http",
  adaptorPackage: "@openfn/language-http",
  body: "fn(state => state);",
  x: 0,
  y: 0,
});

// t → a → b, and a → c: a branches, b and c are leaves.
const workflow: Workflow = {
  id: "w",
  name: "Intake",
  project: "p",
  version: "v1",
  nodes: [
    { id: "t", type: "trigger", triggerType: "webhook", label: "Webhook trigger", subtitle: "", x: 0, y: 0 },
    step("a"),
    step("b"),
    step("c"),
  ],
  edges: [
    { id: "e1", source: "t", target: "a", condition: "always" },
    { id: "e2", source: "a", target: "b", condition: "on_success" },
    { id: "e3", source: "a", target: "c", condition: "on_failure" },
  ],
};

describe("stepDeleteBlockedReason", () => {
  it("lets a step with nothing after it go, and blocks the rest as Lightning does", () => {
    expect(stepDeleteBlockedReason(workflow, "b")).toBeUndefined();
    expect(stepDeleteBlockedReason(workflow, "c")).toBeUndefined();

    const middle: Workflow = {
      ...workflow,
      edges: [...workflow.edges.slice(0, 2), { id: "e3", source: "b", target: "c", condition: "always" }],
    };
    expect(stepDeleteBlockedReason(middle, "b")).toBe("Cannot delete: other jobs depend on this step");

    const onlyStep: Workflow = { ...workflow, nodes: workflow.nodes.slice(0, 2), edges: workflow.edges.slice(0, 1) };
    expect(stepDeleteBlockedReason(onlyStep, "a")).toBe("You can't delete the first step in a workflow.");
    expect(stepDeleteBlockedReason(workflow, "a")).toBe("Cannot delete: other jobs depend on this step");
  });
});
