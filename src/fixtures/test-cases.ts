/**
 * The national ID workflow's test cases, and the plan the assistant writes
 * them from: one test for each requirement it reads in the workflow's
 * spec.md and context.md. Steps are named by their ids in the fixture
 * workflow (`verify`, `search`…) and dataclips by theirs; the fake server
 * turns both into the API's.
 */
import type { TestCase } from "../model/test-cases";

/** A test the assistant writes for a requirement of the spec, with the input it makes to match. */
export interface PlannedTest {
  /** The requirement in the spec (or the context it points to) the test covers. */
  requirement: string;
  name: string;
  inputDescription: string;
  outputDescription: string;
  start?: string;
  end?: string;
  /** Deterministic tests, as the assistant writes them by default. */
  assertions: string;
  /** The input the assistant makes to match the description. */
  sampleInput: Record<string, unknown>;
}

/** What the assistant reads in the national ID workflow's spec, and the test it writes for each. */
export const nationalIdTestPlan: PlannedTest[] = [
  {
    requirement: "Act 1098, s. 12: one person, one record",
    name: "Existing citizen is told their ID",
    inputDescription: "An applicant already registered in Identity, with the same name and date of birth.",
    outputDescription: "The applicant is told their existing national ID by SMS, and no new citizen is created.",
    end: "notify",
    assertions: `expect(state.exactMatch).toBe(true);
expect(state.notified).toBe(true);
expect(state.nationalId).toBeUndefined();`,
    sampleInput: { given_name: "Amara", family_name: "Okafor", date_of_birth: "1991-03-14", phone: "+15555550101", consent: "yes" },
  },
  {
    requirement: "Done when: every run ends with a notification sent",
    name: "New applicant gets a national ID",
    inputDescription: "An adult with a registered birth in OpenCRVS, no record in Identity, who has given consent.",
    outputDescription: "A new citizen is created in Identity and the applicant receives their new national ID by SMS.",
    end: "confirm",
    assertions: `expect(state.exactMatch).toBe(false);
expect(state.nationalId).toMatch(/^NID-/);
expect(state.notified).toBe(true);`,
    sampleInput: { given_name: "Kwame", family_name: "Asante", date_of_birth: "2004-07-22", phone: "+15555550142", consent: "yes" },
  },
  {
    requirement: "Done when: or the application queued",
    name: "Identity is down: application is queued",
    inputDescription: "A valid application sent while Identity answers 503 Service Unavailable.",
    outputDescription: "The application is parked for retry and nothing is created in Identity.",
    start: "search",
    end: "queue",
    assertions: `expect(state.queuedForRetry).toBe(true);
expect(state.nationalId).toBeUndefined();`,
    sampleInput: { given_name: "Lina", family_name: "Haddad", date_of_birth: "1988-11-02", phone: "+15555550118", consent: "yes" },
  },
  {
    requirement: "Data Protection (Amendment) Act: logs never pair a full name with a date of birth",
    name: "Logs never pair a name with a date of birth",
    inputDescription: "Any valid application from a new applicant.",
    outputDescription: "No log line holds the applicant's full name together with their date of birth.",
    assertions: `const lines = state.logs ?? [];
expect(lines.some((l) => l.includes("Kofi Mensah") && l.includes("1976-01-30"))).toBe(false);`,
    sampleInput: { given_name: "Kofi", family_name: "Mensah", date_of_birth: "1976-01-30", phone: "+15555550133", consent: "yes" },
  },
];

/** A seeded test case: a planned one the assistant already wrote, or one written by hand. */
export interface FixtureTestCase {
  name: string;
  inputDescription: string;
  outputDescription: string;
  start?: string;
  end?: string;
  /** A saved dataclip's id, to run with it instead of a generated input. */
  dataclip?: string;
  judge: boolean;
  assertions?: string;
  requirement?: string;
  origin: "you" | "assistant";
  /** How it went the last time it ran, if it has. */
  lastRun?: { status: "passed" | "failed"; ranAt: string; verdict?: string };
  updatedAt: string;
}

const planned = (name: string) => nationalIdTestPlan.find((t) => t.name === name)!;

/** The national ID workflow's test cases: three the assistant wrote from the spec, and one written by hand that fails. */
export const nationalIdTestCases: FixtureTestCase[] = [
  {
    ...planned("Existing citizen is told their ID"),
    // Run with the saved dataclip rather than a generated input.
    dataclip: "saved-existing-citizen",
    judge: false,
    origin: "assistant",
    lastRun: { status: "passed", ranAt: "2 hours ago" },
    updatedAt: "3 days ago",
  },
  {
    ...planned("New applicant gets a national ID"),
    judge: true,
    origin: "assistant",
    lastRun: {
      status: "passed",
      ranAt: "2 hours ago",
      verdict: "A new citizen was created (NID-2026-4F1A9C) and the confirmation SMS names that ID, as the description asks.",
    },
    updatedAt: "3 days ago",
  },
  {
    name: "Near-match goes to a person for review",
    inputDescription:
      "Someone with the same name as an existing citizen but a different date of birth, such as a returning applicant whose day and month were swapped.",
    outputDescription: "The application is held for a person to review. No new citizen is created and no ID is issued.",
    start: "search",
    judge: true,
    origin: "you",
    lastRun: {
      status: "failed",
      ranAt: "2 hours ago",
      verdict:
        "The run created a new citizen and sent them a new national ID. Nothing in the workflow holds a near-match for review: Search for duplicate citizens only tells exact matches apart from everyone else.",
    },
    updatedAt: "yesterday",
  },
  {
    ...planned("Identity is down: application is queued"),
    judge: false,
    origin: "assistant",
    updatedAt: "3 days ago",
  },
];

/** The test cases of each fixture workflow that has some, by its slug. */
export const testCasesByWorkflow: Record<string, { projectSlug: string; tests: FixtureTestCase[] }> = {
  "apply-national-id": { projectSlug: "project-a", tests: nationalIdTestCases },
};

/**
 * The national ID workflow's test cases as the editor gets them, with steps
 * named by the fixture workflow's ids: for stories, where there's no server
 * to run them.
 */
export const nationalIdTestCaseRecords: TestCase[] = nationalIdTestCases.map((t, i) => {
  const plan = nationalIdTestPlan.find((p) => p.name === t.name);
  const passedChecks = (t.assertions ?? "").split("\n").filter((l) => l.startsWith("expect(")).map((label) => ({ label, passed: true }));
  return {
    id: `test-${i + 1}`,
    name: t.name,
    inputDescription: t.inputDescription,
    outputDescription: t.outputDescription,
    startStepId: t.start,
    endStepId: t.end,
    input: t.dataclip ? { kind: "dataclip", dataclipId: t.dataclip, dataclipName: "Sample application: existing citizen" } : { kind: "generated" },
    judge: t.judge,
    assertions: t.assertions,
    requirement: t.requirement,
    origin: t.origin,
    inSpec: true,
    lastResult: t.lastRun && {
      status: t.lastRun.status,
      ranAt: t.lastRun.ranAt,
      input: JSON.stringify(plan?.sampleInput ?? { given_name: "Tomas", family_name: "Rivera", date_of_birth: "1990-05-03", phone: "+15555550160", consent: "yes" }, null, 2),
      steps:
        t.lastRun.status === "passed"
          ? ["Verify birth registration in OpenCRVS", "Search for duplicate citizens in Identity", t.end === "notify" ? "Notify applicant of existing national ID" : "Create new citizen in Identity"]
          : ["Search for duplicate citizens in Identity", "Create new citizen in Identity", "Send confirmation notification with national ID"],
      checks: [...passedChecks, ...(t.judge ? [{ label: "The assistant's judgement", passed: t.lastRun.status === "passed" }] : [])],
      verdict: t.lastRun.verdict,
    },
    updatedAt: t.updatedAt,
  };
});
