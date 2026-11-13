/**
 * The stages a workflow goes through, from the problem it answers to sharing
 * what it does with other teams. They loosely follow the OECD's public sector
 * innovation lifecycle (identifying problems, generating ideas, developing
 * proposals, implementing, evaluating and diffusing lessons), told in terms
 * the editor can check: generating ideas is folded into the proposal, and
 * implementing is split into building, testing and going live. The
 * editor's Overview draws them as a short checklist, so whoever opens the
 * workflow can see where it is and what comes next.
 */
export type LifecycleStageId = "problem" | "proposal" | "build" | "test" | "live" | "evaluate" | "share";

/** The stages in the order a workflow goes through them. */
export const lifecycleStageIds: LifecycleStageId[] = ["problem", "proposal", "build", "test", "live", "evaluate", "share"];

/** The name of each stage, as the Overview shows it. */
export const lifecycleStageLabels: Record<LifecycleStageId, string> = {
  problem: "Identify the problem",
  proposal: "Develop a proposal",
  build: "Build",
  test: "Test",
  live: "Go live",
  evaluate: "Evaluate",
  share: "Share lessons",
};

/** What the editor knows about the workflow that says how far along it is. */
export interface LifecycleFacts {
  /** It has a context.md: the problem, the rule behind it and who it affects. */
  hasContext: boolean;
  /** It has a spec.md: what goes in, what comes out and when a run counts as done. */
  hasSpec: boolean;
  /** How many steps it has, besides its trigger. */
  stepCount: number;
  /**
   * Its test cases: how many it has and how many passed the last time they
   * ran. Left out where there are none to have (the Test cases flag is off),
   * and then a run of this copy succeeding is what counts as tested.
   */
  tests?: { total: number; passed: number };
  /** At least one run of this copy of it has succeeded. */
  testedOk: boolean;
  /** This is main's copy, not a sandbox's. */
  onMain: boolean;
  /** Its trigger is on. */
  live: boolean;
  /** It has run history to look back on. */
  hasRuns: boolean;
  /** It's published as a service other teams can find. */
  published: boolean;
  /** Whether it can be published as a service at all; without, Share lessons is left out. */
  canPublish: boolean;
}

export type LifecycleStageState = "done" | "current" | "upcoming";

export interface LifecycleStage {
  id: LifecycleStageId;
  state: LifecycleStageState;
}

/**
 * Each stage and whether it's done, the one to work on now, or still to come.
 * The current stage is the first that isn't done. Once every stage is, it's
 * Evaluate again: as in the OECD's cycle, looking at how it's doing never
 * ends, and what it shows starts the next round.
 */
export function lifecycleStages(facts: LifecycleFacts): LifecycleStage[] {
  const isLive = facts.onMain && facts.live;
  const done: Record<LifecycleStageId, boolean> = {
    problem: facts.hasContext,
    proposal: facts.hasSpec,
    build: facts.stepCount > 0,
    test: facts.tests ? facts.tests.total > 0 && facts.tests.passed === facts.tests.total : facts.testedOk,
    live: isLive,
    evaluate: isLive && facts.hasRuns,
    share: facts.published,
  };
  const ids = lifecycleStageIds.filter((id) => id !== "share" || facts.canPublish);
  const current = ids.find((id) => !done[id]) ?? "evaluate";
  return ids.map((id) => ({ id, state: id === current ? "current" : done[id] ? "done" : "upcoming" }));
}
