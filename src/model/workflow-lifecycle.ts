/**
 * The stages a workflow goes through, from an idea to something running that
 * you keep an eye on. The editor's Overview draws them as a short checklist,
 * so whoever opens the workflow can see where it is and what comes next.
 */
export type LifecycleStageId = "describe" | "build" | "test" | "live" | "monitor";

/** The stages in the order a workflow goes through them. */
export const lifecycleStageIds: LifecycleStageId[] = ["describe", "build", "test", "live", "monitor"];

/** The name of each stage, as the Overview and the explorer show it. */
export const lifecycleStageLabels: Record<LifecycleStageId, string> = {
  describe: "Describe",
  build: "Build",
  test: "Test",
  live: "Go live",
  monitor: "Monitor",
};

/** What the editor knows about the workflow that says how far along it is. */
export interface LifecycleFacts {
  /** It has a context.md or spec.md saying what it's for. */
  described: boolean;
  /** How many steps it has, besides its trigger. */
  stepCount: number;
  /** At least one run of this copy of it has succeeded. */
  testedOk: boolean;
  /** This is main's copy, not a sandbox's. */
  onMain: boolean;
  /** Its trigger is on. */
  live: boolean;
}

export type LifecycleStageState = "done" | "current" | "upcoming";

export interface LifecycleStage {
  id: LifecycleStageId;
  state: LifecycleStageState;
}

/**
 * Each stage and whether it's done, the one to work on now, or still to come.
 * The current stage is the first that isn't done; Monitor is never done, since
 * watching a live workflow doesn't end, so it's current once the rest are.
 */
export function lifecycleStages(facts: LifecycleFacts): LifecycleStage[] {
  const done: Record<LifecycleStageId, boolean> = {
    describe: facts.described,
    build: facts.stepCount > 0,
    test: facts.testedOk,
    live: facts.onMain && facts.live,
    monitor: false,
  };
  const current = lifecycleStageIds.find((id) => !done[id]) ?? "monitor";
  return lifecycleStageIds.map((id) => ({ id, state: id === current ? "current" : done[id] ? "done" : "upcoming" }));
}
