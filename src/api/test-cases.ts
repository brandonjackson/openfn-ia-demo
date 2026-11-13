/**
 * A workflow's test cases on the demo's own routes
 * (`/api/demo/projects/:id/test_cases`): shapes, mappers, keys and hooks.
 */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { TestCase, TestCaseDraft, TestGeneration, TestResult } from "../model/test-cases";
import { timeAgo } from "../model/time";
import { listAll, request } from "./client";
import { statusOf, type LoadStatus } from "./status";

/** How a run of a test went, as the API sends it. */
interface ApiTestResult {
  status: "passed" | "failed";
  ran_at: string;
  input: string;
  steps: string[];
  checks: { label: string; passed: boolean }[];
  verdict: string | null;
}

/** A test case as the API sends it. */
interface ApiTestCase {
  id: string;
  attributes: {
    workflow_id: string;
    name: string;
    input_description: string;
    output_description: string;
    start_job_id: string | null;
    end_job_id: string | null;
    dataclip_id: string | null;
    dataclip_name: string | null;
    judge: boolean;
    assertions: string | null;
    requirement: string | null;
    origin: "you" | "assistant";
    in_spec: boolean;
    last_result: ApiTestResult | null;
    updated_at: string;
  };
}

const toResult = (r: ApiTestResult): TestResult => ({
  status: r.status,
  ranAt: timeAgo(r.ran_at),
  input: r.input,
  steps: r.steps,
  checks: r.checks,
  verdict: r.verdict ?? undefined,
});

const toTestCase = ({ id, attributes: a }: ApiTestCase): TestCase => ({
  id,
  name: a.name,
  inputDescription: a.input_description,
  outputDescription: a.output_description,
  startStepId: a.start_job_id ?? undefined,
  endStepId: a.end_job_id ?? undefined,
  input: a.dataclip_id ? { kind: "dataclip", dataclipId: a.dataclip_id, dataclipName: a.dataclip_name ?? undefined } : { kind: "generated" },
  judge: a.judge,
  assertions: a.assertions ?? undefined,
  requirement: a.requirement ?? undefined,
  origin: a.origin,
  inSpec: a.in_spec,
  lastResult: a.last_result ? toResult(a.last_result) : undefined,
  updatedAt: timeAgo(a.updated_at),
});

export const testCaseKeys = {
  all: ["test_cases"] as const,
  ofWorkflow: (projectId: string, workflowId: string) => ["test_cases", projectId, workflowId] as const,
};

/** A workflow's test cases, oldest first. Pass undefined to load none, e.g. with the flag off. */
export function useTestCases(projectId: string | undefined, workflowId: string | undefined): { status: LoadStatus; testCases: TestCase[] } {
  const on = !!projectId && !!workflowId;
  const query = useQuery({
    queryKey: testCaseKeys.ofWorkflow(projectId ?? "", workflowId ?? ""),
    enabled: on,
    queryFn: () => listAll<ApiTestCase>(`/api/demo/projects/${projectId}/test_cases?workflow_id=${workflowId}`),
    select: (rows) => rows.map(toTestCase),
  });
  return { status: on ? statusOf(query) : { state: "ready" }, testCases: query.data ?? [] };
}

const bodyOf = (d: TestCaseDraft) => ({
  name: d.name.trim(),
  input_description: d.inputDescription.trim(),
  output_description: d.outputDescription.trim(),
  start_job_id: d.startStepId || null,
  end_job_id: d.endStepId || null,
  dataclip_id: d.dataclipId || null,
  judge: d.judge,
  assertions: d.assertions?.trim() || null,
});

/**
 * Making, changing, deleting, running and generating a workflow's tests.
 * Each resolves once the list has reloaded; a refusal names its field
 * (`name`, `input_description`, `output_description`, `end_job_id`,
 * `assertions`…).
 */
export function useTestCaseSaves(projectId: string, workflowId: string) {
  const queryClient = useQueryClient();
  const refresh = () => queryClient.invalidateQueries({ queryKey: testCaseKeys.ofWorkflow(projectId, workflowId) });
  const path = `/api/demo/projects/${projectId}/test_cases`;
  const create = useMutation({ mutationFn: (draft: TestCaseDraft) => request("POST", path, { workflow_id: workflowId, ...bodyOf(draft) }), onSuccess: refresh });
  const update = useMutation({ mutationFn: ({ id, draft }: { id: string; draft: TestCaseDraft }) => request("PATCH", `${path}/${id}`, bodyOf(draft)), onSuccess: refresh });
  const remove = useMutation({ mutationFn: (id: string) => request("DELETE", `${path}/${id}`), onSuccess: refresh });
  const run = useMutation({ mutationFn: (id: string) => request<{ data: ApiTestResult }>("POST", `${path}/${id}/runs`, {}), onSuccess: refresh });
  const generate = useMutation({
    mutationFn: () =>
      request<{ data: ApiTestCase[]; meta: { created: number; up_to_date: number; not_in_spec: number } }>("POST", `${path}/generations`, { workflow_id: workflowId }),
    onSuccess: refresh,
  });
  return {
    create: async (draft: TestCaseDraft) => void (await create.mutateAsync(draft)),
    update: async (id: string, draft: TestCaseDraft) => void (await update.mutateAsync({ id, draft })),
    remove: async (id: string) => void (await remove.mutateAsync(id)),
    /** Runs one; resolves with how it went, once the list shows it. */
    run: async (id: string): Promise<TestResult> => toResult((await run.mutateAsync(id)).data),
    /** Has the assistant sync the tests with the spec; resolves with what it did. */
    generate: async (): Promise<TestGeneration> => {
      const { data, meta } = await generate.mutateAsync();
      return { created: meta.created, names: data.map((t) => t.attributes.name), upToDate: meta.up_to_date, notInSpec: meta.not_in_spec };
    },
  };
}
