import { describe, expect, it } from "vitest";
import { lifecycleStages, type LifecycleFacts } from "./workflow-lifecycle";

const fresh: LifecycleFacts = { described: false, stepCount: 0, testedOk: false, onMain: false, live: false };
const stateOf = (facts: LifecycleFacts) => Object.fromEntries(lifecycleStages(facts).map((s) => [s.id, s.state]));

describe("lifecycleStages", () => {
  it("starts a new workflow at describing it", () => {
    expect(stateOf(fresh)).toEqual({ describe: "current", build: "upcoming", test: "upcoming", live: "upcoming", monitor: "upcoming" });
  });

  it("makes the first stage that isn't done the current one, keeping later ones done", () => {
    expect(stateOf({ ...fresh, stepCount: 2, testedOk: true })).toMatchObject({ describe: "current", build: "done", test: "done" });
  });

  it("counts a workflow as live only on main with its trigger on", () => {
    const tested = { ...fresh, described: true, stepCount: 2, testedOk: true };
    expect(stateOf({ ...tested, live: true }).live).toBe("current");
    expect(stateOf({ ...tested, onMain: true, live: false }).live).toBe("current");
    expect(stateOf({ ...tested, onMain: true, live: true }).live).toBe("done");
  });

  it("leaves Monitor current once everything else is done", () => {
    expect(stateOf({ described: true, stepCount: 2, testedOk: true, onMain: true, live: true }).monitor).toBe("current");
  });
});
