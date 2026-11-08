/*
 * Old links to a project's components, from before they had UUIDs: a
 * fixture project's slug and a fixture component's slug
 * (`/projects/project-a/components/intake-form`). Routing sends them on, so
 * the component page's wrapper never has to know the fixtures.
 */
import { apiProjectId, fixtureProject } from "../fixtures/projects";
import { apiChannelId, apiCollectionId, apiComponentId, apiWorkflowId } from "../fixtures/ids";

/**
 * Where an old link to a component lands now: one of the project's
 * workflows by its slug opens the editor, any other fixture component's slug its page by its API id.
 * Undefined for anything else, including every link that's already an id.
 */
export function componentLinkTarget(pathname: string): string | undefined {
  const match = pathname.match(/^\/projects\/([^/]+)\/components\/([^/]+)\/?$/);
  if (!match) return undefined;
  const [, projectRef, componentRef] = match as unknown as [string, string, string];
  const project = fixtureProject(projectRef);
  const legacy = project?.components.find((c) => c.id === componentRef);
  if (!project || !legacy) return undefined;
  if (legacy.type === "Workflow") return `/workflow-editor/${apiWorkflowId(legacy.id)}`;
  const id =
    legacy.type === "Channel"
      ? apiChannelId(project.id, legacy.id)
      : legacy.type === "Collection"
        ? apiCollectionId(project.id, legacy.name)
        : apiComponentId(project.id, legacy.id);
  return `/projects/${apiProjectId(project.id)}/components/${id}`;
}
