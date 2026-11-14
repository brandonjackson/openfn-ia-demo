/**
 * Workflows, their versions and sandboxes on Lightning's API
 * (api/workflows.md, api/projects.md "Sandboxes"): the API's shapes, the
 * mappers onto the canvas's `Workflow`, the keys, and the hooks a .query
 * wrapper calls.
 */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Workflow, WorkflowVersion } from "../model/workflow";
import { fromDocument, toDocument, type WorkflowDocument, type WorkflowTrigger } from "../model/workflow-document";
import { formatDate } from "../model/time";
import { listAll, request } from "./client";
import { projectKeys, toProject, type ApiProject } from "./projects";
import type { ProjectDetails } from "../model/projects";
import type { ProjectComponentType } from "../model/component-types";
import type { SandboxFileType } from "../model/workflow-changes";
import { statusOf, type LoadStatus } from "./status";

/** A snapshot as GET /api/workflows/:id/snapshots lists it, with the demo's author and message. */
interface ApiSnapshot {
  id: string;
  lock_version: number;
  inserted_at: string;
  latest: boolean;
  author?: string;
  message?: string | null;
}

/** One saved version of a workflow: its number, who made it and why, and the graph at that version. */
export interface WorkflowSnapshot {
  version: WorkflowVersion;
  lockVersion: number;
  document: Pick<WorkflowDocument, "id" | "name" | "jobs" | "triggers" | "edges" | "positions">;
}

/** A merge preview's line for one workflow (api/projects.md, merge previews). */
export interface MergePreviewWorkflow {
  name: string;
  sourceWorkflowId: string | null;
  targetWorkflowId: string | null;
  change: "new" | "changed" | "unchanged" | "deleted";
  diverged: boolean;
}

export const workflowKeys = {
  all: ["workflows"] as const,
  inProject: (projectId: string) => ["workflows", "project", projectId] as const,
  one: (id: string) => ["workflows", id] as const,
  snapshots: (id: string) => ["workflows", id, "snapshots"] as const,
  sandboxes: (rootId: string) => ["projects", rootId, "sandboxes"] as const,
  preview: (sandboxId: string, targetId: string) => ["projects", sandboxId, "merge_previews", targetId] as const,
};

/**
 * Whether a query is a merge preview, of one sandbox or of a project's
 * sandboxes. Any save can change what a sandbox brings back (a workflow, a
 * doc, a test, a component), so `ApiProvider` asks for them again after each.
 */
export const isMergePreview = (key: readonly unknown[]) => key.includes("merge_previews");

/** "v3": a version's name, from its lock version. */
export const versionName = (lockVersion: number) => `v${lockVersion}`;

/** A project's live workflows, as the API stores them, sorted by name. */
export function useProjectWorkflows(projectId: string | undefined): { status: LoadStatus; workflows: WorkflowDocument[] } {
  const query = useQuery({
    queryKey: workflowKeys.inProject(projectId ?? ""),
    enabled: !!projectId,
    queryFn: () => request<{ workflows: WorkflowDocument[] }>("GET", `/api/projects/${projectId}/workflows`).then((a) => a.workflows),
  });
  return { status: projectId ? statusOf(query) : { state: "loading" }, workflows: query.data ?? [] };
}

/** One workflow, wherever it is: the top-level route answers for any project you can open. */
export function useWorkflow(id: string | undefined): { status: LoadStatus; workflow: WorkflowDocument | undefined } {
  const query = useQuery({
    queryKey: workflowKeys.one(id ?? ""),
    enabled: !!id,
    queryFn: () => request<{ workflow: WorkflowDocument }>("GET", `/api/workflows/${id}`).then((a) => a.workflow),
  });
  return { status: id ? statusOf(query) : { state: "notFound" }, workflow: query.data };
}

/** A workflow's versions, newest first, each with its graph so an earlier one can be shown at once. */
export function useWorkflowSnapshots(id: string | undefined): { status: LoadStatus; snapshots: WorkflowSnapshot[] } {
  const query = useQuery({
    queryKey: workflowKeys.snapshots(id ?? ""),
    enabled: !!id,
    queryFn: async () => {
      const list = await listAll<ApiSnapshot>(`/api/workflows/${id}/snapshots`);
      const docs = await Promise.all(
        list.map((s) => request<{ snapshot: WorkflowSnapshot["document"] }>("GET", `/api/workflows/${id}/snapshots/${s.id}`).then((a) => a.snapshot)),
      );
      return list.map(
        (s, i): WorkflowSnapshot => ({
          version: { id: versionName(s.lock_version), message: s.message ?? "Saved", author: s.author ?? "Unknown", date: formatDate(s.inserted_at) },
          lockVersion: s.lock_version,
          document: docs[i]!,
        }),
      );
    },
  });
  return { status: id ? statusOf(query) : { state: "ready" }, snapshots: query.data ?? [] };
}

/** A stored workflow as the canvas draws it. */
export const asGraph = (doc: WorkflowSnapshot["document"], projectName: string, version = "latest"): Workflow => fromDocument(doc, projectName, version);

/** A project's sandboxes at every depth, each with its parent. */
export function useSandboxes(rootId: string | undefined): { status: LoadStatus; sandboxes: ProjectDetails[] } {
  const query = useQuery({
    queryKey: workflowKeys.sandboxes(rootId ?? ""),
    enabled: !!rootId,
    queryFn: () => listAll<ApiProject>(`/api/projects/${rootId}/sandboxes?depth=all`),
    select: (rows) => rows.map(toProject),
  });
  return { status: rootId ? statusOf(query) : { state: "ready" }, sandboxes: query.data ?? [] };
}

/**
 * A merge preview's line for one of the files a sandbox keeps besides its
 * workflows' steps that a merge would bring: never a deletion. Lightning's
 * preview says it for workflows only; the demo's says it the same way for
 * everything else (components, environment variables, saved dataclips, and
 * each workflow's docs and test cases), so a sandbox's changes are counted
 * in one place.
 */
export interface SandboxFileChange {
  type: SandboxFileType;
  /** Its name, a variable's key, or a doc's file name. */
  name: string;
  change: "new" | "changed";
  /** For a workflow's doc or test, the sandbox's workflow it belongs to: its id and name. */
  workflow?: { id: string; name: string };
}

type FileLine = { name: string; change: "new" | "changed" | "unchanged" };
type WorkflowFileLine = FileLine & { source_workflow_id: string; workflow_name: string };

type PreviewAnswer = {
  workflows: { name: string; source_workflow_id: string | null; target_workflow_id: string | null; change: MergePreviewWorkflow["change"]; diverged: boolean }[];
  // The demo's own extensions; Lightning's sends none of these.
  components?: (Omit<FileLine, "name"> & { component_type: ProjectComponentType; name: string })[];
  env_vars?: (Omit<FileLine, "name"> & { key: string })[];
  dataclips?: FileLine[];
  docs?: WorkflowFileLine[];
  test_cases?: WorkflowFileLine[];
};

/** The new and changed files in a merge preview, in the order the sandbox chip lists them. */
const previewFiles = (a: PreviewAnswer): SandboxFileChange[] => {
  const keep = <T extends { change: FileLine["change"] }>(lines: T[] | undefined, line: (l: T) => Omit<SandboxFileChange, "change">): SandboxFileChange[] =>
    (lines ?? []).flatMap((l) => (l.change === "unchanged" ? [] : [{ ...line(l), change: l.change }]));
  const ofWorkflow = (type: SandboxFileType) => (l: WorkflowFileLine) => ({ type, name: l.name, workflow: { id: l.source_workflow_id, name: l.workflow_name } });
  return [
    ...keep(a.docs, ofWorkflow("Doc")),
    ...keep(a.test_cases, ofWorkflow("Test case")),
    ...keep(a.dataclips, (l) => ({ type: "Saved dataclip", name: l.name })),
    ...keep(a.components, (c) => ({ type: c.component_type, name: c.name })),
    ...keep(a.env_vars, (v) => ({ type: "Environment variable", name: v.key })),
  ];
};

/** What one sandbox brings back to its parent, from the merge preview. */
export interface SandboxPreview {
  /** Its workflows, new, changed, unchanged or deleted. */
  workflows: MergePreviewWorkflow[];
  /** Its new and changed files: docs, test cases, saved dataclips, components and environment variables. */
  files: SandboxFileChange[];
}

/** One sandbox's merge preview into a target. */
async function fetchPreview(parentId: string, sandboxId: string, targetId: string): Promise<SandboxPreview> {
  const a = await request<PreviewAnswer>("POST", `/api/projects/${parentId}/sandboxes/${sandboxId}/merge_previews`, { target_project_id: targetId });
  return {
    workflows: a.workflows.map((w) => ({ name: w.name, sourceWorkflowId: w.source_workflow_id, targetWorkflowId: w.target_workflow_id, change: w.change, diverged: w.diverged })),
    files: previewFiles(a),
  };
}

/**
 * What merging a sandbox into its parent would bring: its workflows and its
 * new and changed files. Writes nothing. Every save anywhere asks for it
 * again (`ApiProvider`), so it's the one place a sandbox's changes are
 * counted from. Pass undefined for main, which has none.
 */
export function useSandboxPreview(parentId: string | undefined, sandboxId: string | undefined): { status: LoadStatus; preview: SandboxPreview } {
  const query = useQuery({
    queryKey: workflowKeys.preview(sandboxId ?? "", parentId ?? ""),
    enabled: !!parentId && !!sandboxId,
    // Asked for again after each save: keep showing the last answer meanwhile.
    placeholderData: (previous, previousQuery) => (previousQuery?.queryKey[1] === sandboxId ? previous : undefined),
    queryFn: () => fetchPreview(parentId!, sandboxId!, parentId!),
  });
  return { status: statusOf(query), preview: (sandboxId && query.data) || { workflows: [], files: [] } };
}

/**
 * Making, changing and deleting workflows. Each resolves once every list and
 * version history showing the workflow has reloaded, and rejects with the
 * `ApiError` (`name` taken, a graph that doesn't hold together).
 */
export function useWorkflowSaves() {
  const queryClient = useQueryClient();
  const refresh = () =>
    Promise.all([queryClient.invalidateQueries({ queryKey: workflowKeys.all }), queryClient.invalidateQueries({ queryKey: projectKeys.all })]);

  const create = useMutation({
    mutationFn: ({ projectId, graph, enabled }: { projectId: string; graph: Workflow; enabled: boolean }) =>
      request<{ workflow: WorkflowDocument }>("POST", `/api/projects/${projectId}/workflows`, toDocument(graph, { enabled })).then((a) => a.workflow),
    onSuccess: refresh,
  });
  const save = useMutation({
    mutationFn: ({ doc, graph }: { doc: WorkflowDocument; graph: Workflow }) =>
      request<{ workflow: WorkflowDocument }>("PATCH", `/api/projects/${doc.project_id}/workflows/${doc.id}`, {
        ...toDocument(graph, { triggers: doc.triggers }),
        lock_version: doc.lock_version,
      }).then((a) => a.workflow),
    onSuccess: refresh,
  });
  const patch = useMutation({
    mutationFn: ({ doc, body }: { doc: WorkflowDocument; body: Record<string, unknown> }) =>
      request<{ workflow: WorkflowDocument }>("PATCH", `/api/projects/${doc.project_id}/workflows/${doc.id}`, body),
    onSuccess: refresh,
  });
  const remove = useMutation({
    mutationFn: (doc: Pick<WorkflowDocument, "id" | "project_id">) => request("DELETE", `/api/projects/${doc.project_id}/workflows/${doc.id}`),
    onSuccess: refresh,
  });
  const copy = useMutation({
    // The demo's own route: api/ has no copy.
    mutationFn: (doc: Pick<WorkflowDocument, "id" | "project_id">) =>
      request<{ workflow: WorkflowDocument }>("POST", `/api/demo/projects/${doc.project_id}/workflows/${doc.id}/copies`, {}).then((a) => a.workflow),
    onSuccess: refresh,
  });

  return {
    /** Makes a workflow from a graph, its trigger on or off, and answers with it as stored (fresh ids throughout). */
    create: (projectId: string, graph: Workflow, enabled = true) => create.mutateAsync({ projectId, graph, enabled }),
    /** Saves the canvas's graph over the stored one: a new version when anything changed. */
    save: (doc: WorkflowDocument, graph: Workflow) => save.mutateAsync({ doc, graph }),
    /** Turns its trigger on or off: on, it runs when its trigger fires; off, only when someone starts it. */
    setEnabled: async (doc: WorkflowDocument, enabled: boolean) =>
      void (await patch.mutateAsync({ doc, body: { triggers: doc.triggers.map((t: WorkflowTrigger) => ({ ...t, enabled })) } })),
    /** Changes its settings (concurrency, keeping job logs). */
    saveSettings: async (doc: WorkflowDocument, settings: { concurrency: number | null; enable_job_logs: boolean }) =>
      void (await patch.mutateAsync({ doc, body: settings })),
    /** Makes a copy in its project, paused and named "… (copy)", and answers with it as stored. */
    copy: (doc: Pick<WorkflowDocument, "id" | "project_id">) => copy.mutateAsync(doc),
    /** Marks it deleted: its triggers go off, and it leaves every list. */
    remove: async (doc: Pick<WorkflowDocument, "id" | "project_id">) => void (await remove.mutateAsync(doc)),
  };
}

/** Making, renaming, merging and deleting sandboxes. Each resolves once the project lists have reloaded. */
export function useSandboxSaves() {
  const queryClient = useQueryClient();
  const refresh = () =>
    Promise.all([queryClient.invalidateQueries({ queryKey: projectKeys.all }), queryClient.invalidateQueries({ queryKey: workflowKeys.all })]);
  const run = useMutation({ mutationFn: (work: () => Promise<unknown>) => work(), onSuccess: refresh });
  const go = <T,>(work: () => Promise<T>) => run.mutateAsync(work) as Promise<T>;
  return {
    /** Makes a sandbox under `parentId` in an environment, a copy of it, saved dataclips included; answers with its id. */
    create: (parentId: string, input: { name: string; color: string | null; env?: string }) =>
      go(async () => {
        const id = crypto.randomUUID();
        await request("PUT", `/api/projects/${parentId}/sandboxes/${id}`, input);
        return id;
      }),
    /** Renames a sandbox or moves it to another environment, keeping its description and colour. */
    update: (id: string, input: { name: string; description: string; color: string | null; env?: string }) =>
      go(() => request("PUT", `/api/projects/${id}`, input)).then(() => undefined),
    /** Merges a sandbox's chosen workflows into its target as a new version of each. */
    merge: (parentId: string, sandboxId: string, input: { targetId: string; workflowIds?: string[]; message?: string }) =>
      go(() =>
        request("POST", `/api/projects/${parentId}/sandboxes/${sandboxId}/merges`, {
          target_project_id: input.targetId,
          ...(input.workflowIds && { workflow_ids: input.workflowIds }),
          ...(input.message && { message: input.message }),
        }),
      ).then(() => undefined),
    /** Deletes a sandbox and the sandboxes made from it. */
    remove: (id: string) => go(() => request("DELETE", `/api/projects/${id}`)).then(() => undefined),
  };
}

/**
 * What each sandbox has changed since it was made from its parent, by
 * sandbox id: the merge preview against its parent, keeping only what a
 * merge would bring (new and changed workflows and files).
 */
export function useSandboxChanges(rootId: string | undefined, sandboxes: ProjectDetails[]): { status: LoadStatus; changes: Record<string, SandboxPreview> } {
  const ids = sandboxes.map((s) => `${s.id}:${s.parentId}`).join(",");
  const query = useQuery({
    queryKey: [...workflowKeys.sandboxes(rootId ?? ""), "merge_previews", ids],
    enabled: !!rootId,
    // A sandbox made or deleted changes the key: keep showing this project's last answer, so the page isn't
    // swapped for a spinner. Another project's would put its changes on the wrong sandboxes.
    placeholderData: (previous, previousQuery) => (previousQuery?.queryKey[1] === rootId ? previous : undefined),
    queryFn: async () => {
      const previews = await Promise.all(sandboxes.map((s) => fetchPreview(s.parentId!, s.id, s.parentId!)));
      return Object.fromEntries(
        sandboxes.map((s, i): [string, SandboxPreview] => [
          s.id,
          { workflows: previews[i]!.workflows.filter((w) => w.change === "new" || w.change === "changed"), files: previews[i]!.files },
        ]),
      );
    },
  });
  return { status: statusOf(query), changes: query.data ?? {} };
}

/** The live workflows of several projects at once (History across projects), by project. */
export function useWorkflowsInProjects(projectIds: string[]): { status: LoadStatus; workflows: WorkflowDocument[] } {
  const query = useQuery({
    queryKey: [...workflowKeys.all, "projects", ...projectIds],
    enabled: projectIds.length > 0,
    queryFn: async () =>
      (await Promise.all(projectIds.map((p) => request<{ workflows: WorkflowDocument[] }>("GET", `/api/projects/${p}/workflows`).then((a) => a.workflows)))).flat(),
  });
  return { status: projectIds.length ? statusOf(query) : { state: "ready" }, workflows: query.data ?? [] };
}
