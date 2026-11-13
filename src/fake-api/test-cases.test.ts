import { beforeEach, describe, expect, it } from "vitest";
import { forgetCsrfToken, request, type ApiError } from "../api/client";
import { resetFakeApi, setWait, signInAs } from ".";
import { apiNodeId, apiWorkflowId } from "../fixtures/ids";
import { projectIdFor } from "./projects";

const a = projectIdFor("project-a");
const workflowId = apiWorkflowId("apply-national-id");
const step = (slug: string) => apiNodeId("apply-national-id", slug);
const refusal = (p: Promise<unknown>) => p.then(() => undefined, (e: unknown) => e as ApiError);

interface Result {
  status: "passed" | "failed";
  steps: string[];
  checks: { label: string; passed: boolean }[];
  verdict: string | null;
  input: string;
}
type Test = {
  id: string;
  attributes: { name: string; requirement: string | null; origin: string; in_spec: boolean; judge: boolean; assertions: string | null; last_result: Result | null; dataclip_name: string | null; start_job_id: string | null; end_job_id: string | null; input_body: string | null; expected_output: string | null };
};

const base = (projectId = a) => `/api/demo/projects/${projectId}/test_cases`;
const list = (projectId = a, wf = workflowId) => request<{ data: Test[] }>("GET", `${base(projectId)}?workflow_id=${wf}&page_size=100`).then((r) => r.data);
const make = (body: Record<string, unknown>) => request<{ data: Test }>("POST", base(), { workflow_id: workflowId, ...body }).then((r) => r.data);
const run = (id: string, projectId = a) => request<{ data: Result }>("POST", `${base(projectId)}/${id}/runs`, {}).then((r) => r.data);

beforeEach(() => {
  setWait(0);
  resetFakeApi();
  forgetCsrfToken();
});

describe("test cases", () => {
  it("lists a workflow's tests, with how each went last time", async () => {
    const tests = await list();
    expect(tests.map((t) => t.attributes.name)).toContain("Near-match goes to a person for review");
    const existing = tests.find((t) => t.attributes.name === "Existing citizen is told their ID")!;
    expect(existing.attributes).toMatchObject({ origin: "assistant", in_spec: true, dataclip_name: "Sample application: existing citizen" });
    expect(existing.attributes.last_result?.status).toBe("passed");
    expect(tests.find((t) => t.attributes.name === "Near-match goes to a person for review")!.attributes.last_result?.status).toBe("failed");
  });

  it("makes, changes, runs and deletes one", async () => {
    const made = await make({
      name: "Consent missing stops the run",
      input_description: "An application with consent set to no.",
      output_description: "Nothing reaches Identity.",
      end_job_id: step("search"),
    });
    expect(made.attributes).toMatchObject({ origin: "you", judge: true, last_result: null, end_job_id: step("search") });

    const result = await run(made.id);
    expect(result.status).toBe("passed");
    expect(result.steps).toEqual(["Verify birth registration in OpenCRVS", "Search for duplicate citizens in Identity"]);
    expect(result.checks).toEqual([{ label: "The assistant's judgement", passed: true }]);
    expect((await list()).find((t) => t.id === made.id)!.attributes.last_result?.status).toBe("passed");

    const changed = await request<{ data: Test }>("PATCH", `${base()}/${made.id}`, { judge: false, assertions: "expect(state.matches).toBeUndefined();" });
    expect(changed.data.attributes).toMatchObject({ judge: false, assertions: "expect(state.matches).toBeUndefined();" });
    expect((await run(made.id)).checks).toEqual([{ label: "expect(state.matches).toBeUndefined();", passed: true }]);

    await request("DELETE", `${base()}/${made.id}`);
    expect((await list()).some((t) => t.id === made.id)).toBe(false);
  });

  it("fails a test whose expected output the workflow can't give, and says why", async () => {
    const near = (await list()).find((t) => t.attributes.name === "Near-match goes to a person for review")!;
    const result = await run(near.id);
    expect(result.status).toBe("failed");
    expect(result.checks.at(-1)).toEqual({ label: "The assistant's judgement", passed: false });
    expect(result.verdict).toMatch(/review/);
  });

  it("checks the name, the descriptions, the steps and what it checks", async () => {
    const bad = await refusal(make({ name: "", input_description: "", output_description: "", judge: false, assertions: "" }));
    // Without the assistant judging, the output's description is optional.
    expect(Object.keys(bad?.fieldErrors ?? {}).sort()).toEqual(["assertions", "input_description", "name"]);
    const judged = await refusal(make({ name: "Judged", input_description: "x", output_description: "", judge: true }));
    expect(judged?.fieldErrors["output_description"]).toEqual(["can't be blank while the assistant judges the output"]);
    const taken = await refusal(make({ name: "existing citizen is told their id", input_description: "x", output_description: "y" }));
    expect(taken?.fieldErrors["name"]).toBeTruthy();
    const backwards = await refusal(make({ name: "Backwards", input_description: "x", output_description: "y", start_job_id: step("confirm"), end_job_id: step("verify") }));
    expect(backwards?.fieldErrors["end_job_id"]).toEqual(["can't be reached from the start step"]);
    // A saved dataclip stands in for the input's description.
    const withClip = await make({ name: "From a dataclip", output_description: "y", dataclip_id: "saved-new-citizen" });
    expect(withClip.attributes.dataclip_name).toBe("Sample application: new citizen");
  });

  it("runs with an attached input and compares with an attached expected output", async () => {
    const input = JSON.stringify({ given_name: "Esi", family_name: "Boateng", date_of_birth: "2001-02-09", consent: "yes" }, null, 2);
    const made = await make({
      name: "Attached applicant",
      // No description is needed with an input attached, nor without the assistant judging.
      input_description: "",
      output_description: "",
      input_body: input,
      judge: false,
      expected_output: JSON.stringify({ notified: true }),
    });
    expect(made.attributes).toMatchObject({ input_body: input, expected_output: '{"notified":true}', dataclip_name: null });

    const result = await run(made.id);
    expect(result).toMatchObject({ status: "passed", input });
    expect(result.checks).toEqual([{ label: "Matches the expected output", passed: true }]);

    // An expected output the workflow can't give fails its comparison.
    const near = (await list()).find((t) => t.attributes.name === "Near-match goes to a person for review")!;
    expect(near.attributes.input_body).toMatch(/Okafor/);
    const failed = await run(near.id);
    expect(failed.input).toBe(near.attributes.input_body);
    expect(failed.checks).toEqual([
      { label: "Matches the expected output", passed: false },
      { label: "The assistant's judgement", passed: false },
    ]);

    // Switching to a saved dataclip clears the attached input.
    const switched = await request<{ data: Test }>("PATCH", `${base()}/${made.id}`, { dataclip_id: "saved-new-citizen", input_body: null });
    expect(switched.data.attributes).toMatchObject({ input_body: null, dataclip_name: "Sample application: new citizen" });
  });

  it("checks attached JSON, and that an input isn't both attached and a dataclip", async () => {
    const bad = await refusal(make({ name: "Bad JSON", input_body: "{ nope", output_description: "y", expected_output: "[1, 2]" }));
    expect(bad?.fieldErrors["input_body"]).toEqual(["isn't valid JSON"]);
    expect(bad?.fieldErrors["expected_output"]).toEqual(["must be a JSON object"]);
    const both = await refusal(make({ name: "Both", input_body: "{}", dataclip_id: "saved-new-citizen", output_description: "y" }));
    expect(both?.fieldErrors["input_body"]).toBeTruthy();
    const nothing = await refusal(make({ name: "Nothing checked", input_body: "{}", judge: false }));
    expect(nothing?.fieldErrors["assertions"]).toEqual(["write deterministic tests, attach an expected output, or let the assistant judge the output"]);
    expect(nothing?.fieldErrors["output_description"]).toBeUndefined();
  });

  it("syncs the tests with the spec, writing deterministic tests for what isn't covered", async () => {
    const answer = await request<{ data: Test[]; meta: { created: number; up_to_date: number; not_in_spec: number } }>("POST", `${base()}/generations`, { workflow_id: workflowId });
    expect(answer.meta).toEqual({ created: 1, up_to_date: 3, not_in_spec: 0 });
    expect(answer.data[0]!.attributes).toMatchObject({ name: "Logs never pair a name with a date of birth", origin: "assistant", judge: false });
    expect(answer.data[0]!.attributes.assertions).toMatch(/expect\(/);
    // Again, and everything's covered.
    const again = await request<{ meta: { created: number } }>("POST", `${base()}/generations`, { workflow_id: workflowId });
    expect(again.meta.created).toBe(0);
  });

  it("lets a viewer read them but not change or run them", async () => {
    const [first] = await list();
    signInAs("user-beth");
    await expect(list()).resolves.toBeTruthy();
    expect((await refusal(make({ name: "X", input_description: "x", output_description: "y" })))?.code).toBe("forbidden");
    expect((await refusal(run(first!.id)))?.code).toBe("forbidden");
  });

  it("copies a workflow's tests into a new sandbox, and merges new ones back", async () => {
    const sandbox = await request<{ data: { id: string } }>("PUT", `/api/projects/${a}/sandboxes/${crypto.randomUUID()}`, { name: "tests" }).then((r) => r.data);
    const copies = await request<{ workflows: { id: string; name: string }[] }>("GET", `/api/projects/${sandbox.id}/workflows`).then((r) => r.workflows);
    const copy = copies.find((w) => w.name === "Apply for a national ID")!;
    const inSandbox = await list(sandbox.id, copy.id);
    expect(inSandbox.map((t) => t.attributes.name).sort()).toEqual((await list()).map((t) => t.attributes.name).sort());
    expect(inSandbox.every((t) => t.attributes.last_result === null)).toBe(true);

    await request("POST", base(sandbox.id), {
      workflow_id: copy.id,
      name: "Written in the sandbox",
      input_description: "x",
      output_description: "y",
      end_job_id: inSandbox[0]!.attributes.end_job_id,
    });
    await request("POST", `/api/projects/${a}/sandboxes/${sandbox.id}/merges`, {});
    const merged = (await list()).find((t) => t.attributes.name === "Written in the sandbox");
    expect(merged?.attributes.end_job_id).toBe(step("notify"));
  });
});
