/**
 * Saving dataclips (the demo's own routes, under `/api/demo/`, since
 * api/dataclips.md only lists them). A project's dataclips are
 * read with `useDataclips` in `./work-orders`, beside the runs that use them.
 */
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Dataclip } from "../model/workflow";
import type { DataclipChanges, DataclipDraft } from "../model/dataclips";
import { request } from "./client";
import { runKeys } from "./work-orders";

/** Saving a new input under a name, and renaming or describing a saved one. Each resolves once the project's dataclips have reloaded. */
export function useDataclipSaves() {
  const queryClient = useQueryClient();
  const run = useMutation({
    mutationFn: (work: () => Promise<unknown>) => work(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: runKeys.all }),
  });
  const go = <T,>(work: () => Promise<T>) => run.mutateAsync(work) as Promise<T>;
  return {
    /** Saves an input in the project, on a workflow when given one; answers with the saved dataclip. */
    create: (projectId: string, draft: DataclipDraft, workflowId?: string) =>
      go(() =>
        request<{ data: Dataclip }>("POST", `/api/demo/projects/${projectId}/dataclips`, {
          ...draft,
          ...(workflowId && { workflow_id: workflowId }),
        }),
      ).then((r) => r.data),
    /** Changes a saved dataclip's name and description. */
    update: (projectId: string, id: string, changes: DataclipChanges) =>
      go(() => request("PATCH", `/api/demo/projects/${projectId}/dataclips/${id}`, changes)).then(() => undefined),
  };
}
