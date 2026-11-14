import { describe, expect, it } from "vitest";
import type { JobNode, Workflow } from "./workflow";
import { edgeConditionsFor, stepDeleteBlockedReason } from "./workflow";
import { fromDocument, toDocument } from "./workflow-document";

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

describe("paths", () => {
  const graph: Workflow = {
    id: "w",
    name: "w",
    project: "p",
    version: "latest",
    nodes: [{ id: "t", type: "trigger", triggerType: "webhook", label: "Webhook trigger", subtitle: "", x: 0, y: 0 }, step("a"), step("b")],
    edges: [
      { id: "e1", source: "t", target: "a", condition: "always" },
      { id: "e2", source: "a", target: "b", condition: "js_expression", expression: "!state.error", label: "No error", enabled: false },
    ],
  };

  it("keeps a path's label and whether it's on through Lightning's document, as condition_label and enabled", () => {
    const doc = toDocument(graph);
    expect(doc.edges[1]).toMatchObject({ condition_type: "js_expression", condition_expression: "!state.error", condition_label: "No error", enabled: false });
    expect(doc.edges[0]).toMatchObject({ condition_label: null, enabled: true });
    const back = fromDocument({ ...doc, id: "w" }, "p");
    expect(back.edges).toEqual(graph.edges);
  });

  it("sends an expression only for an On match path", () => {
    const doc = toDocument({ ...graph, edges: [graph.edges[0], { ...graph.edges[1], condition: "on_success" }] });
    expect(doc.edges[1].condition_expression).toBeNull();
  });

  it("offers a trigger's path only Always and On match", () => {
    expect(edgeConditionsFor(true).map((o) => o.value)).toEqual(["always", "js_expression"]);
    expect(edgeConditionsFor(false)).toHaveLength(4);
  });
});
