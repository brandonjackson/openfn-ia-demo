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
  preview: (sandboxId: string, targetId: string) => ["projects", sandboxId, "merge_preview", targetId] as const,
};

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

/** What merging a sandbox into a target would bring, and what changed there since. Writes nothing. */
export function useMergePreview(parentId: string, sandboxId: string | undefined, targetId: string | undefined) {
  const query = useQuery({
    queryKey: workflowKeys.preview(sandboxId ?? "", targetId ?? ""),
    enabled: !!sandboxId && !!targetId,
    queryFn: () =>
      request<{ workflows: { name: string; source_workflow_id: string | null; target_workflow_id: string | null; change: MergePreviewWorkflow["change"]; diverged: boolean }[] }>(
        "POST",
        `/api/projects/${parentId}/sandboxes/${sandboxId}/merge_previews`,
        { target_project_id: targetId },
      ),
    select: (a): MergePreviewWorkflow[] =>
      a.workflows.map((w) => ({ name: w.name, sourceWorkflowId: w.source_workflow_id, targetWorkflowId: w.target_workflow_id, change: w.change, diverged: w.diverged })),
  });
  return { status: statusOf(query), workflows: query.data ?? [] };
}

/** A merge preview's line for one component or environment variable a merge would bring: never a deletion. */
export interface MergePreviewComponent {
  /** The component's kind, or "Environment variable". */
  type: ProjectComponentType | "Environment variable";
  /** Its name, or a variable's key. */
  name: string;
  change: "new" | "changed";
}

/**
 * What a sandbox changes in its project's components and environment
 * variables against its parent: the new and changed ones a merge would
 * bring. `version` says when the sandbox's own changed (its components'
 * lock versions, say), so the preview is asked for again; a merge refreshes
 * it too.
 */
export function useSandboxComponentChanges(parentId: string | undefined, sandboxId: string | undefined, version: string): { status: LoadStatus; changes: MergePreviewComponent[] } {
  const query = useQuery({
    queryKey: [...workflowKeys.preview(sandboxId ?? "", parentId ?? ""), "components", version],
    enabled: !!parentId && !!sandboxId,
    placeholderData: (previous) => previous,
    queryFn: () =>
      // The demo's own extensions to the preview; Lightning's sends neither.
      request<{
        components?: { component_type: ProjectComponentType; name: string; change: "new" | "changed" | "unchanged" }[];
        env_vars?: { key: string; change: "new" | "changed" | "unchanged" }[];
      }>("POST", `/api/projects/${parentId}/sandboxes/${sandboxId}/merge_previews`, { target_project_id: parentId }),
    select: (a): MergePreviewComponent[] => [
      ...(a.components ?? []).flatMap((c) => (c.change === "unchanged" ? [] : [{ type: c.component_type, name: c.name, change: c.change }])),
      ...(a.env_vars ?? []).flatMap((v) => (v.change === "unchanged" ? [] : [{ type: "Environment variable" as const, name: v.key, change: v.change }])),
    ],
  });
  return { status: statusOf(query), changes: (sandboxId && query.data) || [] };
}

/** Every merge preview at once, for a list of sandboxes, keyed by sandbox id. */
export async function fetchMergePreview(parentId: string, sandboxId: string, targetId: string): Promise<MergePreviewWorkflow[]> {
  const a = await request<{ workflows: { name: string; source_workflow_id: string | null; target_workflow_id: string | null; change: MergePreviewWorkflow["change"]; diverged: boolean }[] }>(
    "POST",
    `/api/projects/${parentId}/sandboxes/${sandboxId}/merge_previews`,
    { target_project_id: targetId },
  );
  return a.workflows.map((w) => ({ name: w.name, sourceWorkflowId: w.source_workflow_id, targetWorkflowId: w.target_workflow_id, change: w.change, diverged: w.diverged }));
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
    /** Makes a sandbox under `parentId`, bringing the parent's saved dataclips in `dataclipIds` along; answers with its id. */
    create: (parentId: string, input: { name: string; color: string | null; dataclipIds?: string[] }) =>
      go(async () => {
        const id = crypto.randomUUID();
        const { dataclipIds, ...rest } = input;
        await request("PUT", `/api/projects/${parentId}/sandboxes/${id}`, { ...rest, ...(dataclipIds?.length && { dataclip_ids: dataclipIds }) });
        return id;
      }),
    /** Renames or recolours a sandbox. */
    update: (id: string, input: { name: string; description: string; color: string | null }) =>
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
 * merge would bring (new and changed workflows).
 */
export function useSandboxChanges(rootId: string | undefined, sandboxes: ProjectDetails[]): { status: LoadStatus; changes: Record<string, MergePreviewWorkflow[]> } {
  const ids = sandboxes.map((s) => `${s.id}:${s.parentId}`).join(",");
  const query = useQuery({
    queryKey: [...workflowKeys.sandboxes(rootId ?? ""), "changes", ids],
    enabled: !!rootId,
    // A sandbox made or deleted changes the key: keep showing this project's last answer, so the page isn't
    // swapped for a spinner. Another project's would put its changes on the wrong sandboxes.
    placeholderData: (previous, previousQuery) => (previousQuery?.queryKey[1] === rootId ? previous : undefined),
    queryFn: async () => {
      const previews = await Promise.all(sandboxes.map((s) => fetchMergePreview(s.parentId!, s.id, s.parentId!)));
      return Object.fromEntries(sandboxes.map((s, i) => [s.id, previews[i]!.filter((w) => w.change === "new" || w.change === "changed")]));
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
