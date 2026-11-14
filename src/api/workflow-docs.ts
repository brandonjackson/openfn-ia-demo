/**
 * A workflow's docs on the demo's own routes
 * (`/api/demo/projects/:id/workflow_docs`): shapes, mappers, keys and hooks.
 */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { WorkflowDoc } from "../model/workflow-docs";
import { listAll, request } from "./client";
import { statusOf, type LoadStatus } from "./status";

/** A doc as the API sends it. */
interface ApiWorkflowDoc {
  id: string;
  attributes: { workflow_id: string; name: string; content: string; updated_at: string };
}

const toDoc = ({ id, attributes: a }: ApiWorkflowDoc): WorkflowDoc => ({ id, name: a.name, content: a.content });

export const workflowDocKeys = {
  all: ["workflow_docs"] as const,
  ofWorkflow: (projectId: string, workflowId: string) => ["workflow_docs", projectId, workflowId] as const,
};

/** A workflow's docs, by name. Pass undefined to load none, e.g. with the flag off. */
export function useWorkflowDocs(projectId: string | undefined, workflowId: string | undefined): { status: LoadStatus; docs: WorkflowDoc[] } {
  const on = !!projectId && !!workflowId;
  const query = useQuery({
    queryKey: workflowDocKeys.ofWorkflow(projectId ?? "", workflowId ?? ""),
    enabled: on,
    queryFn: () => listAll<ApiWorkflowDoc>(`/api/demo/projects/${projectId}/workflow_docs?workflow_id=${workflowId}`),
    select: (rows) => rows.map(toDoc),
  });
  return { status: on ? statusOf(query) : { state: "ready" }, docs: query.data ?? [] };
}

/**
 * Writing a workflow's docs. `save` makes the doc by that name or changes
 * the one there is; each resolves once the list has reloaded, and a refusal
 * names its field (`name`, `content`).
 */
export function useWorkflowDocSaves(projectId: string, workflowId: string, docs: WorkflowDoc[]) {
  const queryClient = useQueryClient();
  const refresh = () => queryClient.invalidateQueries({ queryKey: workflowDocKeys.ofWorkflow(projectId, workflowId) });
  const path = `/api/demo/projects/${projectId}/workflow_docs`;
  const save = useMutation({
    mutationFn: ({ name, content }: { name: string; content: string }) => {
      const existing = docs.find((d) => d.name === name);
      return existing ? request("PATCH", `${path}/${existing.id}`, { content }) : request("POST", path, { workflow_id: workflowId, name, content });
    },
    onSuccess: refresh,
  });
  return {
    save: async (name: string, content: string) => void (await save.mutateAsync({ name, content })),
  };
}
