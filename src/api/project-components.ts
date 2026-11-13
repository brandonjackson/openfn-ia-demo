/**
 * A project's forms, artifacts, AI skills, documents and static websites on
 * the demo's own routes (`/api/demo/projects/:id/components`): shapes,
 * mappers, keys and hooks.
 */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ComponentContent, ComponentDraft, ContentComponentType } from "../model/project-components";
import type { ProjectComponent } from "../model/projects";
import { timeAgo } from "../model/time";
import { listAll, request, none } from "./client";
import { statusOf, type LoadStatus } from "./status";

/** A component as the API sends it. */
interface ApiComponent {
  id: string;
  attributes: {
    component_type: ContentComponentType;
    name: string;
    description: string;
    content: string;
    lock_version: number;
    updated_by: string;
    updated_at: string;
  };
}

/** A component as the project holds it: the entry in its lists, what it holds, and what a save needs back. */
export interface ComponentResource {
  component: ProjectComponent & { type: ContentComponentType };
  details: ComponentContent;
  lockVersion: number;
}

const toResource = ({ id, attributes: a }: ApiComponent): ComponentResource => ({
  component: { id, name: a.name, description: a.description, type: a.component_type },
  details: { content: a.content, updatedAt: timeAgo(a.updated_at), updatedBy: a.updated_by },
  lockVersion: a.lock_version,
});

export const componentKeys = { inProject: (projectId: string) => ["components", projectId] as const };

/** A project's forms, artifacts, AI skills, documents and static websites, each with its content. */
export function useComponents(projectId: string | undefined): { status: LoadStatus; components: ComponentResource[] } {
  const query = useQuery({
    queryKey: componentKeys.inProject(projectId ?? ""),
    enabled: !!projectId,
    queryFn: () => listAll<ApiComponent>(`/api/demo/projects/${projectId}/components`),
    select: (rows) => rows.map(toResource),
  });
  return { status: projectId ? statusOf(query) : { state: "ready" }, components: query.data ?? none };
}

/**
 * Making, renaming and changing the content of components, and deleting
 * them. Each resolves once the list has reloaded; a refusal names its field
 * (`name`, `content`), or is a 409 `concurrent_edit` when someone else
 * changed it first.
 */
export function useComponentSaves(projectId: string) {
  const queryClient = useQueryClient();
  const refresh = () =>
    Promise.all([queryClient.invalidateQueries({ queryKey: componentKeys.inProject(projectId) }), queryClient.invalidateQueries({ queryKey: ["audit_events"] })]);
  const put = useMutation({
    mutationFn: ({ id, body }: { id: string; body: Record<string, unknown> }) => request<{ data: ApiComponent }>("PUT", `/api/demo/projects/${projectId}/components/${id}`, body),
    onSuccess: refresh,
  });
  const remove = useMutation({ mutationFn: (id: string) => request("DELETE", `/api/demo/projects/${projectId}/components/${id}`), onSuccess: refresh });
  return {
    /** Makes a component with the content it starts from; answers with its id. */
    create: async (type: ContentComponentType, draft: ComponentDraft, content: string) => {
      const id = crypto.randomUUID();
      await put.mutateAsync({ id, body: { component_type: type, name: draft.name.trim(), description: draft.description.trim(), content } });
      return id;
    },
    rename: async (resource: ComponentResource, draft: ComponentDraft) =>
      void (await put.mutateAsync({ id: resource.component.id, body: { name: draft.name.trim(), description: draft.description.trim(), lock_version: resource.lockVersion } })),
    saveContent: async (resource: ComponentResource, content: string) =>
      void (await put.mutateAsync({ id: resource.component.id, body: { content, lock_version: resource.lockVersion } })),
    remove: async (id: string) => void (await remove.mutateAsync(id)),
  };
}
