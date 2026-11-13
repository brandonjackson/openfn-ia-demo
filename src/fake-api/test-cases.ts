/**
 * A workflow's test cases on the pretend server. Lightning's API has none,
 * so they live under `/api/demo/`, follow api/conventions.md and hang off the
 * project (beside a real Lightning this server never sees its workflows, so
 * a test names its workflow in `workflow_id`).
 *
 * Lifecycle:
 * - `GET /api/demo/projects/:project_id/test_cases?workflow_id=…` lists a
 *   workflow's tests (every test in the project without it), by name, for
 *   any member, each with how it went last time (`last_result`).
 * - `POST` makes one (201): a `name` unique among the workflow's tests; what
 *   goes in, as an `input_description` the assistant writes an input to
 *   match, a saved dataclip (`dataclip_id`) or JSON attached to the test
 *   (`input_body`, an object), the last two never both (the description is
 *   optional with either); an `output_description` (needed when the
 *   assistant judges); where it starts and stops (`start_job_id`,
 *   `end_job_id`: null for the first step and the final output, and the end
 *   must be reachable from the start); and how it's checked: `judge` (the
 *   assistant judges the output against its description), `assertions`
 *   (deterministic tests) and `expected_output` (JSON attached to the test,
 *   an object whose every key must come out the same), at least one.
 * - `PATCH .../:id` changes any of those under the same rules; `DELETE`
 *   removes it (204).
 * - `POST .../:id/runs` runs it (201): the assistant makes an input to
 *   match the description (or takes the dataclip or the attached input), runs the workflow from
 *   the start step to the end, and checks what came out. The answer is the
 *   result, kept as the test's `last_result`. The run is the demo standing
 *   in for Lightning's worker and the assistant: it isn't in run history.
 * - `POST .../test_cases/generations` syncs a workflow's tests with its
 *   spec (201): the assistant writes a test, with deterministic tests and no
 *   judgement, for each requirement no test covers yet. `meta` says how many
 *   it wrote, how many were already covered, and how many of its earlier
 *   tests cover a requirement that's gone (those say `in_spec: false`).
 * - Editors and up make, change, delete, run and generate them.
 * - A test belongs to its workflow, and a sandbox's copy of the workflow has
 *   its own: making a sandbox copies them (results left behind), and a merge
 *   brings the sandbox's new and changed ones back with the workflow, never
 *   deleting the target's (sandboxes.ts).
 */
import { testCasesByWorkflow, nationalIdTestPlan, type PlannedTest } from "../fixtures/test-cases";
import { nationalIdWorkflow } from "../fixtures/workflow";
import { apiNodeId, apiWorkflowId, cloneNodeId, seedId } from "../fixtures/ids";
import { badId, invalid, isUuid, json, maxLength, noContent, notFound, now, ORIGIN, paged, unknownKeys, type Body, type Entry, type Handler } from "./answers";
import { seedTime, table } from "./db";
import { guardProject, projectIdFor } from "./projects";
import { withSandboxCopies } from "./sandbox-copies";
import { currentUserId } from "./session";
import { findUser, fullName } from "./users";
import { dataclips } from "./work-orders";
import { findWorkflow, type WorkflowRow } from "./workflows";

/** How a run of a test went, as stored and sent. */
interface ResultRow {
  status: "passed" | "failed";
  ran_at: string;
  input: string;
  steps: string[];
  checks: { label: string; passed: boolean }[];
  verdict: string | null;
}

export interface TestCaseRow {
  id: string;
  project_id: string;
  workflow_id: string;
  name: string;
  input_description: string;
  output_description: string;
  start_job_id: string | null;
  end_job_id: string | null;
  dataclip_id: string | null;
  /** JSON attached as the input, run as it is; null for a generated input or a dataclip. */
  input_body: string | null;
  judge: boolean;
  assertions: string | null;
  /** JSON the final state is compared with; null not to compare. */
  expected_output: string | null;
  requirement: string | null;
  origin: "you" | "assistant";
  last_result: ResultRow | null;
  updated_by: string;
  inserted_at: string;
  updated_at: string;
  /** In a sandbox, the test in the parent it was copied from, which a merge changes; null for one made here. */
  copied_from?: string | null;
}

/* ------------------------------------------------------------------ */
/*  Seed                                                               */
/* ------------------------------------------------------------------ */

/** A sandbox's copy of a test, on the sandbox's copy of its workflow, without its results. */
export const copyTestCase = (t: TestCaseRow, sandboxId: string, workflowId = seedId("workflow", `${sandboxId}/${t.workflow_id}`)): TestCaseRow => ({
  ...t,
  id: seedId("test_case", `${sandboxId}/${t.id}`),
  project_id: sandboxId,
  workflow_id: workflowId,
  start_job_id: t.start_job_id && cloneNodeId(sandboxId, t.start_job_id),
  end_job_id: t.end_job_id && cloneNodeId(sandboxId, t.end_job_id),
  last_result: null,
  copied_from: t.id,
});

const testCasesSeed = (): TestCaseRow[] =>
  Object.entries(testCasesByWorkflow).flatMap(([slug, { projectSlug, tests }]) =>
    tests.map((t) => {
      const workflowId = apiWorkflowId(slug);
      const at = seedTime(t.updatedAt);
      const row: TestCaseRow = {
        id: seedId("test_case", `${slug}/${t.name}`),
        project_id: projectIdFor(projectSlug),
        workflow_id: workflowId,
        name: t.name,
        input_description: t.inputDescription,
        output_description: t.outputDescription,
        start_job_id: t.start ? apiNodeId(slug, t.start) : null,
        end_job_id: t.end ? apiNodeId(slug, t.end) : null,
        dataclip_id: t.dataclip ?? null,
        input_body: t.inputBody ?? null,
        judge: t.judge,
        assertions: t.assertions ?? null,
        expected_output: t.expectedOutput ?? null,
        requirement: t.requirement ?? null,
        origin: t.origin,
        last_result: null,
        updated_by: "Brandon Jackson",
        inserted_at: at,
        updated_at: at,
      };
      if (!t.lastRun) return row;
      // The seeded result is what a run gives today, with the fixture's verdict and time.
      const ran = simulate(row, t.lastRun.status === "failed");
      return { ...row, last_result: { ...ran, ran_at: seedTime(t.lastRun.ranAt), verdict: t.lastRun.verdict ?? ran.verdict } };
    }),
  );

export const testCases = table<TestCaseRow>("test_cases", () => withSandboxCopies(testCasesSeed(), (t, sandboxId) => copyTestCase(t, sandboxId)));

/* ------------------------------------------------------------------ */
/*  The workflow's graph                                               */
/* ------------------------------------------------------------------ */

type Doc = Pick<WorkflowRow, "jobs" | "edges">;

/** The step after the trigger. */
const firstJob = (w: Doc) => w.edges.find((e) => e.source_trigger_id)?.target_job_id ?? w.jobs[0]?.id ?? null;

const jobName = (w: Doc, id: string) => w.jobs.find((j) => j.id === id)?.name ?? id;

/** The steps from `start` to `end`, the shortest way, or null when it can't be reached. */
function pathTo(w: Doc, start: string, end: string): string[] | null {
  const queue: string[][] = [[start]];
  const seen = new Set([start]);
  while (queue.length) {
    const path = queue.shift()!;
    const at = path.at(-1)!;
    if (at === end) return path;
    for (const e of w.edges.filter((x) => x.source_job_id === at && !seen.has(x.target_job_id))) {
      seen.add(e.target_job_id);
      queue.push([...path, e.target_job_id]);
    }
  }
  return null;
}

/** The steps from `start` to the workflow's final output: the longest way that doesn't go through a failure. */
function pathToEnd(w: Doc, start: string, seen = new Set<string>()): string[] {
  const next = w.edges.filter((e) => e.source_job_id === start && e.condition_type !== "on_job_failure" && !seen.has(e.target_job_id));
  const longest = next
    .map((e) => pathToEnd(w, e.target_job_id, new Set([...seen, start])))
    .reduce<string[]>((best, p) => (p.length > best.length ? p : best), []);
  return [start, ...longest];
}

/** The steps a run of the test walks, or why it can't run. */
function walk(t: Pick<TestCaseRow, "start_job_id" | "end_job_id">, w: Doc): string[] | string {
  const start = t.start_job_id ?? firstJob(w);
  if (!start || !w.jobs.some((j) => j.id === start)) return "Its start step is no longer in the workflow.";
  if (t.end_job_id && !w.jobs.some((j) => j.id === t.end_job_id)) return "Its end step is no longer in the workflow.";
  const path = t.end_job_id ? pathTo(w, start, t.end_job_id) : pathToEnd(w, start);
  return path ?? "Its end step can't be reached from its start step.";
}

/* ------------------------------------------------------------------ */
/*  The assistant                                                      */
/* ------------------------------------------------------------------ */

/** The tests the assistant would write from the workflow's spec, with their steps' ids in this workflow. */
function planFor(w: Doc): (Omit<PlannedTest, "start" | "end"> & { start: string | null; end: string | null })[] {
  const byName = (slug: string | undefined) => {
    if (!slug) return null;
    const label = nationalIdWorkflow.nodes.find((n) => n.id === slug)?.label;
    return w.jobs.find((j) => j.name === label)?.id;
  };
  // The national ID workflow's spec and context: its requirements, wherever the workflow's steps are still there.
  const isNationalId = nationalIdTestPlan.every((p) => byName(p.start) !== undefined && byName(p.end) !== undefined);
  if (isNationalId) return nationalIdTestPlan.map((p) => ({ ...p, start: byName(p.start) ?? null, end: byName(p.end) ?? null }));
  // Any other workflow: its spec is the steps it has, so a test for each way a run can end.
  const ends = w.jobs.filter((j) => !w.edges.some((e) => e.source_job_id === j.id && e.condition_type !== "on_job_failure"));
  return ends.map((j) => ({
    requirement: `spec.md: a run can end at "${j.name}"`,
    name: `Reaches ${j.name}`,
    inputDescription: `A typical request the trigger receives, of the kind that should end at "${j.name}".`,
    outputDescription: `The run finishes at "${j.name}" with no failed steps.`,
    start: null,
    end: j.id,
    assertions: `expect(state.errors ?? []).toHaveLength(0);`,
    sampleInput: {},
  }));
}

/** Whether the test's requirement is still in the spec: always, for one you wrote or one on a workflow this server doesn't know. */
function inSpec(t: TestCaseRow): boolean {
  if (t.origin !== "assistant" || !t.requirement) return true;
  const w = findWorkflow(t.workflow_id);
  return !w || planFor(w).some((p) => p.requirement === t.requirement);
}

/** The input the assistant makes to match a description: the plan's for a planned test, or the workflow's latest input. */
function generatedInput(t: TestCaseRow, w: Doc | undefined): string {
  const planned = nationalIdTestPlan.find((p) => p.requirement === t.requirement || p.name === t.name);
  if (planned) return JSON.stringify(planned.sampleInput, null, 2);
  const latest = dataclips.rows().findLast((d) => d.workflow_id === t.workflow_id && d.type === "http_request");
  if (latest) return latest.body;
  return JSON.stringify({ note: w ? "Written to match the input's description." : "" }, null, 2);
}

/** What the assistant expects of an output that its workflow can't give: a person reviewing it, with no step that does. */
function unmet(t: TestCaseRow, steps: string[]): string | undefined {
  if (/\breview/i.test(t.output_description) && !steps.some((s) => /review/i.test(s))) {
    return "The run went on without stopping for review: nothing in the workflow holds the application for a person to look at.";
  }
  return undefined;
}

/** The check a run makes of a test with an expected output attached. */
export const EXPECTED_OUTPUT_CHECK = "Matches the expected output";

/** A run of the test, as the assistant would make and judge it. `fail` forces a failure, for the seed. */
function simulate(t: TestCaseRow, fail = false): ResultRow {
  const w = findWorkflow(t.workflow_id);
  const clip = t.dataclip_id ? dataclips.rows().find((d) => d.id === t.dataclip_id) : undefined;
  const input = clip ? clip.body : (t.input_body ?? generatedInput(t, w));
  const assertions = (t.assertions ?? "")
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.startsWith("expect("));
  const ran_at = now();
  const failed = (verdict: string): ResultRow => ({ status: "failed", ran_at, input, steps: [], checks: [], verdict });

  if (t.dataclip_id && !clip) return failed("The dataclip it runs with has been deleted.");
  const walked = w ? walk(t, w) : [];
  if (typeof walked === "string") return failed(walked);
  const steps = w ? walked.map((id) => jobName(w, id)) : [];
  const problem = fail ? "The output doesn't match the description." : unmet(t, steps);
  const checks = [
    // A failure the assistant judged leaves the deterministic tests passing; without a judge or an expected output, the first fails.
    ...assertions.map((label, i) => ({ label, passed: !problem || t.judge || !!t.expected_output || i !== 0 })),
    // An output that isn't what the description asks never matches the one attached.
    ...(t.expected_output ? [{ label: EXPECTED_OUTPUT_CHECK, passed: !problem }] : []),
    ...(t.judge ? [{ label: "The assistant's judgement", passed: !problem }] : []),
  ];
  return {
    status: problem ? "failed" : "passed",
    ran_at,
    input,
    steps,
    checks,
    verdict: t.judge ? (problem ?? `What came out matches the description: ${t.output_description.charAt(0).toLowerCase()}${t.output_description.slice(1)}`) : (problem ?? null),
  };
}

/* ------------------------------------------------------------------ */
/*  What the API sends                                                 */
/* ------------------------------------------------------------------ */

const entry = (t: TestCaseRow) => ({
  type: "test_cases",
  id: t.id,
  attributes: {
    workflow_id: t.workflow_id,
    name: t.name,
    input_description: t.input_description,
    output_description: t.output_description,
    start_job_id: t.start_job_id,
    end_job_id: t.end_job_id,
    dataclip_id: t.dataclip_id,
    dataclip_name: t.dataclip_id ? (dataclips.rows().find((d) => d.id === t.dataclip_id)?.name ?? null) : null,
    input_body: t.input_body,
    judge: t.judge,
    assertions: t.assertions,
    expected_output: t.expected_output,
    requirement: t.requirement,
    origin: t.origin,
    in_spec: inSpec(t),
    last_result: t.last_result,
    updated_by: t.updated_by,
    inserted_at: t.inserted_at,
    updated_at: t.updated_at,
  },
  links: { self: `${ORIGIN}/api/demo/projects/${t.project_id}/test_cases/${t.id}` },
});

/* ------------------------------------------------------------------ */
/*  Checking what's sent                                               */
/* ------------------------------------------------------------------ */

const KEYS = ["workflow_id", "name", "input_description", "output_description", "start_job_id", "end_job_id", "dataclip_id", "input_body", "judge", "assertions", "expected_output"];

type Fields = Omit<TestCaseRow, "id" | "project_id" | "requirement" | "origin" | "last_result" | "updated_by" | "inserted_at" | "updated_at" | "copied_from">;

const text = (body: Body, key: string, errors: Entry[], fallback = "") => {
  const v = body[key];
  if (v === undefined) return fallback;
  if (v !== null && typeof v !== "string") {
    errors.push({ code: "type", detail: "must be a string", pointer: `#/${key}` });
    return fallback;
  }
  return (v ?? "").trim();
};

/** Attached JSON, which must be an object (a run's state), or null for none. */
const attachedJson = (body: Body, key: string, errors: Entry[], fallback: string | null) => {
  const v = text(body, key, errors, fallback ?? "") || null;
  if (v === null) return null;
  maxLength(v, 100_000, `#/${key}`, errors);
  try {
    const parsed: unknown = JSON.parse(v);
    if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) errors.push({ code: "format", detail: "must be a JSON object", pointer: `#/${key}` });
  } catch {
    errors.push({ code: "format", detail: "isn't valid JSON", pointer: `#/${key}` });
  }
  return v;
};

const nullableId = (body: Body, key: string, errors: Entry[], fallback: string | null) => {
  const v = body[key];
  if (v === undefined) return fallback;
  if (v === null || v === "") return null;
  if (typeof v !== "string") {
    errors.push({ code: "type", detail: "must be a string or null", pointer: `#/${key}` });
    return fallback;
  }
  return v;
};

/** The fields a body makes of `existing` (or of nothing), and what's wrong with them. */
function checked(projectId: string, body: Body, existing?: TestCaseRow): { errors: Entry[]; fields: Fields } {
  const errors = unknownKeys(body, KEYS);
  if (existing && body["workflow_id"] !== undefined && body["workflow_id"] !== existing.workflow_id) {
    errors.push({ code: "immutable", detail: "can't be changed", pointer: "#/workflow_id" });
  }
  const workflow_id = existing?.workflow_id ?? (typeof body["workflow_id"] === "string" ? body["workflow_id"] : "");
  const workflow = workflow_id ? findWorkflow(workflow_id) : undefined;
  if (!existing) {
    if (!isUuid(workflow_id)) errors.push({ code: "required", detail: "must name the workflow", pointer: "#/workflow_id" });
    else if (workflow && workflow.project_id !== projectId) errors.push({ code: "not_found", detail: "isn't a workflow in this project", pointer: "#/workflow_id" });
  }

  const name = text(body, "name", errors, existing?.name);
  if (!name) errors.push({ code: "required", detail: "can't be blank", pointer: "#/name" });
  maxLength(name, 200, "#/name", errors);
  const taken = testCases
    .rows()
    .some((t) => t.workflow_id === workflow_id && t.id !== existing?.id && t.name.toLowerCase() === name.toLowerCase());
  if (name && taken) errors.push({ code: "taken", detail: "is already the name of another test of this workflow", pointer: "#/name" });

  const dataclip_id = nullableId(body, "dataclip_id", errors, existing?.dataclip_id ?? null);
  if (dataclip_id && !dataclips.rows().some((d) => d.id === dataclip_id)) errors.push({ code: "not_found", detail: "isn't a saved dataclip", pointer: "#/dataclip_id" });
  // Picking one way in sets the other to null; sending only one of them on a change leaves the other as it was, so check them together.
  const input_body = attachedJson(body, "input_body", errors, existing?.input_body ?? null);
  if (input_body && dataclip_id) errors.push({ code: "exclusive", detail: "can't be attached to a test that runs with a saved dataclip", pointer: "#/input_body" });

  const input_description = text(body, "input_description", errors, existing?.input_description);
  if (!input_description && !dataclip_id && !input_body) {
    errors.push({ code: "required", detail: "say what goes in, attach an input, or run it with a saved dataclip", pointer: "#/input_description" });
  }
  maxLength(input_description, 4000, "#/input_description", errors);

  if (body["judge"] !== undefined && typeof body["judge"] !== "boolean") errors.push({ code: "type", detail: "must be a boolean", pointer: "#/judge" });
  const judge = typeof body["judge"] === "boolean" ? body["judge"] : (existing?.judge ?? true);

  const output_description = text(body, "output_description", errors, existing?.output_description);
  if (!output_description && judge) errors.push({ code: "required", detail: "can't be blank while the assistant judges the output", pointer: "#/output_description" });
  maxLength(output_description, 4000, "#/output_description", errors);

  const start_job_id = nullableId(body, "start_job_id", errors, existing?.start_job_id ?? null);
  const end_job_id = nullableId(body, "end_job_id", errors, existing?.end_job_id ?? null);
  if (workflow) {
    if (start_job_id && !workflow.jobs.some((j) => j.id === start_job_id)) errors.push({ code: "not_found", detail: "isn't a step of the workflow", pointer: "#/start_job_id" });
    else if (end_job_id && !workflow.jobs.some((j) => j.id === end_job_id)) errors.push({ code: "not_found", detail: "isn't a step of the workflow", pointer: "#/end_job_id" });
    else if (end_job_id && typeof walk({ start_job_id, end_job_id }, workflow) === "string") {
      errors.push({ code: "unreachable", detail: "can't be reached from the start step", pointer: "#/end_job_id" });
    }
  }

  const assertions = text(body, "assertions", errors, existing?.assertions ?? "") || null;
  maxLength(assertions ?? "", 20_000, "#/assertions", errors);
  const expected_output = attachedJson(body, "expected_output", errors, existing?.expected_output ?? null);
  if (!judge && !assertions && !expected_output) {
    errors.push({ code: "required", detail: "write deterministic tests, attach an expected output, or let the assistant judge the output", pointer: "#/assertions" });
  }

  return {
    errors,
    fields: { workflow_id, name, input_description, output_description, start_job_id, end_job_id, dataclip_id, input_body, judge, assertions, expected_output },
  };
}

const by = () => {
  const me = findUser(currentUserId());
  return me ? fullName(me) : "Someone";
};

/** A test of the project, by id, or the answer saying why not. */
function found(projectId: string, id: string, least: "viewer" | "editor") {
  const p = guardProject(projectId, least);
  if (p instanceof Response) return p;
  if (!isUuid(id)) return badId("id");
  return testCases.rows().find((t) => t.id === id && t.project_id === p.id) ?? notFound();
}

/* ------------------------------------------------------------------ */
/*  Sandboxes                                                          */
/* ------------------------------------------------------------------ */

/** Copies the tests of each workflow a new sandbox copied (by the parent's workflow id to its copy's). */
export function copyTestCasesInto(sandboxId: string, copies: Map<string, string>) {
  for (const t of testCases.rows().filter((x) => copies.has(x.workflow_id))) testCases.insert(copyTestCase(t, sandboxId, copies.get(t.workflow_id)!));
}

const content = (t: TestCaseRow, jobId: (id: string | null) => string | null = (id) => id) =>
  JSON.stringify([
    t.name,
    t.input_description,
    t.output_description,
    jobId(t.start_job_id),
    jobId(t.end_job_id),
    t.dataclip_id,
    t.input_body,
    t.judge,
    t.assertions,
    t.expected_output,
    t.requirement,
  ]);

/**
 * Brings a sandbox workflow's new and changed tests into the target's copy
 * of it, its steps' ids turned into the target's by `jobId`. Pairs them by
 * the one each was copied from, or name; deletes nothing.
 */
export function mergeTestCases(sandboxWorkflowId: string, targetWorkflowId: string, targetProjectId: string, jobId: (id: string | null) => string | null) {
  const at = now();
  for (const t of testCases.rows().filter((x) => x.workflow_id === sandboxWorkflowId)) {
    const theirs = testCases.rows().filter((x) => x.workflow_id === targetWorkflowId);
    const pair = theirs.find((x) => x.id === t.copied_from) ?? theirs.find((x) => x.name.toLowerCase() === t.name.toLowerCase());
    if (pair && content(t, jobId) === content(pair)) continue;
    const fields = {
      name: t.name,
      input_description: t.input_description,
      output_description: t.output_description,
      start_job_id: jobId(t.start_job_id),
      end_job_id: jobId(t.end_job_id),
      dataclip_id: t.dataclip_id,
      input_body: t.input_body,
      judge: t.judge,
      assertions: t.assertions,
      expected_output: t.expected_output,
      requirement: t.requirement,
      origin: t.origin,
      updated_by: by(),
      updated_at: at,
    };
    if (pair) testCases.update((x) => x.id === pair.id, (x) => ({ ...x, ...fields }));
    else testCases.insert({ ...t, ...fields, id: crypto.randomUUID(), project_id: targetProjectId, workflow_id: targetWorkflowId, last_result: null, inserted_at: at, copied_from: null });
  }
}

/* ------------------------------------------------------------------ */
/*  Routes                                                             */
/* ------------------------------------------------------------------ */

export const testCaseRoutes: Record<string, Handler> = {
  "GET /api/demo/projects/:project_id/test_cases": ({ project_id }, _body, query) => {
    const p = guardProject(project_id!);
    if (p instanceof Response) return p;
    const workflowId = query.get("workflow_id");
    const rows = testCases
      .rows()
      .filter((t) => t.project_id === p.id && (!workflowId || t.workflow_id === workflowId))
      .sort((a, b) => a.inserted_at.localeCompare(b.inserted_at) || a.name.localeCompare(b.name))
      .map(entry);
    return json(200, paged(`/api/demo/projects/${p.id}/test_cases`, rows, query));
  },

  "POST /api/demo/projects/:project_id/test_cases": ({ project_id }, body) => {
    const p = guardProject(project_id!, "editor");
    if (p instanceof Response) return p;
    const { errors, fields } = checked(p.id, body);
    if (errors.length) return invalid(errors);
    const at = now();
    const row: TestCaseRow = { id: crypto.randomUUID(), project_id: p.id, ...fields, requirement: null, origin: "you", last_result: null, updated_by: by(), inserted_at: at, updated_at: at };
    testCases.insert(row);
    return json(201, { data: entry(row) });
  },

  "PATCH /api/demo/projects/:project_id/test_cases/:id": ({ project_id, id }, body) => {
    const t = found(project_id!, id!, "editor");
    if (t instanceof Response) return t;
    const { errors, fields } = checked(t.project_id, body, t);
    if (errors.length) return invalid(errors);
    const row: TestCaseRow = { ...t, ...fields, updated_by: by(), updated_at: now() };
    testCases.update((x) => x.id === t.id, () => row);
    return json(200, { data: entry(row) });
  },

  "DELETE /api/demo/projects/:project_id/test_cases/:id": ({ project_id, id }) => {
    const t = found(project_id!, id!, "editor");
    if (t instanceof Response) return t;
    testCases.remove((x) => x.id === t.id);
    return noContent();
  },

  "POST /api/demo/projects/:project_id/test_cases/:id/runs": ({ project_id, id }, body) => {
    const t = found(project_id!, id!, "editor");
    if (t instanceof Response) return t;
    const errors = unknownKeys(body, []);
    if (errors.length) return invalid(errors);
    const result = simulate(t);
    testCases.update((x) => x.id === t.id, (x) => ({ ...x, last_result: result }));
    return json(201, { data: result });
  },

  "POST /api/demo/projects/:project_id/test_cases/generations": ({ project_id }, body) => {
    const p = guardProject(project_id!, "editor");
    if (p instanceof Response) return p;
    const errors = unknownKeys(body, ["workflow_id"]);
    const workflowId = body["workflow_id"];
    const workflow = typeof workflowId === "string" && isUuid(workflowId) ? findWorkflow(workflowId) : undefined;
    if (!workflow || workflow.project_id !== p.id) errors.push({ code: "not_found", detail: "isn't a workflow in this project", pointer: "#/workflow_id" });
    if (errors.length || !workflow) return invalid(errors);

    const plan = planFor(workflow);
    const existing = testCases.rows().filter((t) => t.workflow_id === workflow.id);
    const missing = plan.filter((r) => !existing.some((t) => t.requirement === r.requirement));
    const at = now();
    const names = new Set(existing.map((t) => t.name.toLowerCase()));
    const made = missing.map((r): TestCaseRow => {
      let name = r.name;
      for (let n = 2; names.has(name.toLowerCase()); n++) name = `${r.name} (${n})`;
      names.add(name.toLowerCase());
      return {
        id: crypto.randomUUID(),
        project_id: p.id,
        workflow_id: workflow.id,
        name,
        input_description: r.inputDescription,
        output_description: r.outputDescription,
        start_job_id: r.start,
        end_job_id: r.end,
        dataclip_id: null,
        input_body: null,
        expected_output: null,
        // Deterministic tests by default; the assistant's judgement is yours to turn on.
        judge: false,
        assertions: r.assertions,
        requirement: r.requirement,
        origin: "assistant",
        last_result: null,
        updated_by: "Assistant",
        inserted_at: at,
        updated_at: at,
      };
    });
    for (const row of made) testCases.insert(row);
    const generated = existing.filter((t) => t.origin === "assistant" && t.requirement);
    return json(201, {
      data: made.map(entry),
      meta: {
        created: made.length,
        up_to_date: plan.length - missing.length,
        not_in_spec: generated.filter((t) => !plan.some((r) => r.requirement === t.requirement)).length,
      },
    });
  },
};
