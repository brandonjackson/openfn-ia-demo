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
      test: "upcoming",
      live: "upcoming",
      evaluate: "upcoming",
      share: "upcoming",
    });
  });

  it("makes the first stage that isn't done the current one, keeping later ones done", () => {
    expect(stateOf({ ...fresh, hasContext: true, stepCount: 2, testedOk: true })).toMatchObject({ problem: "done", proposal: "current", build: "done", test: "done" });
  });

  it("counts testing as done once every test case passed", () => {
    const built = { ...fresh, hasContext: true, hasSpec: true, stepCount: 2, testedOk: true };
    expect(stateOf({ ...built, tests: { total: 0, passed: 0 } }).test).toBe("current");
    expect(stateOf({ ...built, tests: { total: 3, passed: 2 } }).test).toBe("current");
    expect(stateOf({ ...built, tests: { total: 3, passed: 3 } }).test).toBe("done");
  });

  it("counts a successful run as tested where there are no test cases to have", () => {
    const built = { ...fresh, hasContext: true, hasSpec: true, stepCount: 2 };
    expect(stateOf(built).test).toBe("current");
    expect(stateOf({ ...built, testedOk: true }).test).toBe("done");
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
