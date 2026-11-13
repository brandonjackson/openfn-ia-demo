import { describe, expect, it } from "vitest";
import { lifecycleStages, type LifecycleFacts } from "./workflow-lifecycle";

const fresh: LifecycleFacts = {
  hasContext: false,
  hasSpec: false,
  stepCount: 0,
  testedOk: false,
  onMain: false,
  live: false,
  hasRuns: false,
  published: false,
  canPublish: true,
};
const everything: LifecycleFacts = { ...fresh, hasContext: true, hasSpec: true, stepCount: 3, testedOk: true, onMain: true, live: true, hasRuns: true, published: true };
const stateOf = (facts: LifecycleFacts) => Object.fromEntries(lifecycleStages(facts).map((s) => [s.id, s.state]));

describe("lifecycleStages", () => {
  it("starts a new workflow at identifying the problem", () => {
    expect(stateOf(fresh)).toEqual({
      problem: "current",
      proposal: "upcoming",
      build: "upcoming",
      live: "upcoming",
      evaluate: "upcoming",
      share: "upcoming",
    });
  });

  it("makes the first stage that isn't done the current one, keeping later ones done", () => {
    expect(stateOf({ ...fresh, hasContext: true, stepCount: 2, testedOk: true })).toMatchObject({ problem: "done", proposal: "current", build: "done" });
  });

  it("counts building as done only once a run has succeeded", () => {
    expect(stateOf({ ...fresh, hasContext: true, hasSpec: true, stepCount: 2 }).build).toBe("current");
  });

  it("counts a workflow as live only on main with its trigger on", () => {
    const tested = { ...fresh, hasContext: true, hasSpec: true, stepCount: 2, testedOk: true };
    expect(stateOf({ ...tested, live: true }).live).toBe("current");
    expect(stateOf({ ...tested, onMain: true, live: false }).live).toBe("current");
    expect(stateOf({ ...tested, onMain: true, live: true }).live).toBe("done");
  });

  it("moves on to sharing once a live workflow has runs to look back on", () => {
    expect(stateOf({ ...everything, published: false })).toMatchObject({ evaluate: "done", share: "current" });
  });

  it("comes back round to Evaluate once everything is done", () => {
    expect(stateOf(everything)).toMatchObject({ evaluate: "current", share: "done" });
  });

  it("leaves Share lessons out where a workflow can't be published", () => {
    expect(lifecycleStages({ ...fresh, canPublish: false }).map((s) => s.id)).not.toContain("share");
  });
});
