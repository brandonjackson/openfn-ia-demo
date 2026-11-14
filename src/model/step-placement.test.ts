import { describe, expect, it } from "vitest";
import type { JobNode, Workflow, WorkflowEdge } from "./workflow";
import { BRANCH_GAP, ROW_GAP, placeAfter } from "./step-placement";

const step = (id: string, x: number, y: number): JobNode => ({
  id,
  type: "job",
  label: id,
  adaptor: "http",
  adaptorPackage: "@openfn/language-http",
  body: "fn(state => state);",
  x,
  y,
});
const edge = (source: string, target: string): WorkflowEdge => ({ id: `${source}-${target}`, source, target, condition: "on_success" });
const flow = (nodes: JobNode[], edges: WorkflowEdge[]): Workflow => ({ id: "w", name: "w", project: "p", version: "v1", nodes, edges });

describe("placeAfter", () => {
  it("puts the first step after a node straight below it", () => {
    const w = flow([step("a", 100, 0)], []);
    expect(placeAfter(w, "a")).toEqual({ position: { x: 100, y: ROW_GAP }, moves: {} });
  });

  it("balances a second child and the first on either side of the parent", () => {
    // a → b → c: adding a second child of a moves b, and c below it, half a branch left.
    const w = flow([step("a", 100, 0), step("b", 100, ROW_GAP), step("c", 100, 2 * ROW_GAP)], [edge("a", "b"), edge("b", "c")]);
    const { position, moves } = placeAfter(w, "a");
    expect(position).toEqual({ x: 100 + BRANCH_GAP / 2, y: ROW_GAP });
    expect(moves).toEqual({ b: { x: 100 - BRANCH_GAP / 2, y: ROW_GAP }, c: { x: 100 - BRANCH_GAP / 2, y: 2 * ROW_GAP } });
  });

  it("keeps three children centred, and leaves a step two branches share where it is", () => {
    // a → b, a → c, and both lead to d.
    const w = flow(
      [step("a", 0, 0), step("b", -160, ROW_GAP), step("c", 160, ROW_GAP), step("d", 0, 2 * ROW_GAP)],
      [edge("a", "b"), edge("a", "c"), edge("b", "d"), edge("c", "d")],
    );
    const { position, moves } = placeAfter(w, "a");
    expect(position.x).toBe(BRANCH_GAP);
    expect(moves).toEqual({ b: { x: -BRANCH_GAP, y: ROW_GAP }, c: { x: 0, y: ROW_GAP } });
  });
});
