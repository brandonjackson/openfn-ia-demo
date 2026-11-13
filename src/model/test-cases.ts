/**
 * A workflow's test cases: scenarios written in plain words, which the
 * assistant runs. Each says what goes in and what should come out, and
 * where in the workflow to start and stop. The assistant makes an input to
 * match the input's description (or the test uses a saved dataclip), runs
 * the workflow between the two steps, and checks what came out: it judges
 * the output against the description, runs the test's deterministic tests,
 * or both.
 */

/** Where a test's input comes from. */
export type TestInput =
  /** The assistant writes one to match the input's description, each time it runs. */
  | { kind: "generated" }
  /** A saved dataclip, run as it is. */
  | { kind: "dataclip"; dataclipId: string; dataclipName?: string };

/** One check a run of a test made, and how it went. */
export interface TestCheck {
  /** What it checked, e.g. `expect(state.notified).toBe(true)` or "The assistant's judgement". */
  label: string;
  passed: boolean;
}

/** How a test went, the last time it ran. */
export interface TestResult {
  status: "passed" | "failed";
  /** When it ran, as the page shows it ("2 minutes ago"). */
  ranAt: string;
  /** The input it ran with, as pretty-printed JSON: the one the assistant made, or the dataclip's. */
  input: string;
  /** The steps the run walked, by name, from the start step to the end. */
  steps: string[];
  /** Each deterministic test, then the assistant's judgement, when it judged. */
  checks: TestCheck[];
  /** What the assistant made of the output, in a sentence or two, when it judged it; or why the test couldn't run. */
  verdict?: string;
}

export interface TestCase {
  id: string;
  /** The scenario's name, e.g. "Existing citizen is told their ID". */
  name: string;
  /** What goes in, in plain words; the assistant writes an input to match when the input is generated. */
  inputDescription: string;
  /** What should come out, in plain words; the assistant judges the output against it. */
  outputDescription: string;
  /** The step it starts at; left out, the workflow's first step. */
  startStepId?: string;
  /** The step it stops after; left out, the workflow's final output. */
  endStepId?: string;
  input: TestInput;
  /** Whether the assistant judges the output against its description. */
  judge: boolean;
  /** Deterministic tests, as code run against the final state; left out when there are none. */
  assertions?: string;
  /** The requirement in spec.md it was written for, when the assistant generated it from the spec. */
  requirement?: string;
  /** Who wrote it: you, or the assistant from the spec. */
  origin: "you" | "assistant";
  /** For one generated from the spec: false once its requirement is no longer in it. */
  inSpec: boolean;
  /** How it went the last time it ran; left out until it has. */
  lastResult?: TestResult;
  updatedAt: string;
}

/** A test case as its form writes it. */
export interface TestCaseDraft {
  name: string;
  inputDescription: string;
  outputDescription: string;
  /** Empty for the workflow's first step. */
  startStepId?: string;
  /** Empty for the workflow's final output. */
  endStepId?: string;
  /** A saved dataclip to run with; empty to have the assistant generate one. */
  dataclipId?: string;
  judge: boolean;
  /** Deterministic tests; empty for none. */
  assertions?: string;
}

/** What syncing the tests with the spec did. */
export interface TestGeneration {
  /** Tests written for requirements nothing covered yet. */
  created: number;
  /** Requirements a test already covered. */
  upToDate: number;
  /** Generated tests whose requirement is no longer in the spec. */
  notInSpec: number;
}

/** What a test case's form starts with: the assistant makes the input and judges the output. */
export const emptyTestCaseDraft: TestCaseDraft = {
  name: "",
  inputDescription: "",
  outputDescription: "",
  judge: true,
  assertions: "",
};

/** A test case as its form edits it. */
export const draftOf = (t: TestCase): TestCaseDraft => ({
  name: t.name,
  inputDescription: t.inputDescription,
  outputDescription: t.outputDescription,
  startStepId: t.startStepId,
  endStepId: t.endStepId,
  dataclipId: t.input.kind === "dataclip" ? t.input.dataclipId : undefined,
  judge: t.judge,
  assertions: t.assertions ?? "",
});

/** How a test went, or "not run" before it has: for its badge and the summary. */
export type TestState = TestResult["status"] | "running" | "not_run";

export const testStateLabels: Record<TestState, string> = {
  passed: "Passed",
  failed: "Failed",
  running: "Running",
  not_run: "Not run",
};

/** How many tests are in each state, for the summary over the list and the explorer's count. */
export function testTally(tests: TestCase[], running: ReadonlySet<string> = new Set()): Record<TestState, number> {
  const tally: Record<TestState, number> = { passed: 0, failed: 0, running: 0, not_run: 0 };
  for (const t of tests) tally[running.has(t.id) ? "running" : (t.lastResult?.status ?? "not_run")] += 1;
  return tally;
}

/** What a test checks, in a few words: "AI judge", "Deterministic tests" or both. */
export function checksOf(t: Pick<TestCase, "judge" | "assertions">): string[] {
  return [...(t.assertions?.trim() ? ["Deterministic tests"] : []), ...(t.judge ? ["AI judge"] : [])];
}

/** A name for a new test no other has: "Untitled test", "Untitled test 2"… */
export function untitledTestName(taken: TestCase[]): string {
  const names = new Set(taken.map((t) => t.name.toLowerCase()));
  let name = "Untitled test";
  for (let n = 2; names.has(name.toLowerCase()); n++) name = `Untitled test ${n}`;
  return name;
}
