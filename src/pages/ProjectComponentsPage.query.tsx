import { useNavigate } from "react-router-dom";
import type { PageRoute } from "../app/ia-utils";
import Loaded from "../app/Loaded";
import { useFlags } from "../app/feature-flags";
import { useProject } from "../api/projects";
import { useProjectWorkflows } from "../api/workflows";
import { combine } from "../api/status";
import { fixtureWorkflow } from "../fixtures/projects";
import { starterContent } from "../model/project-components";
import ProjectComponentsPage from "./ProjectComponentsPage";
import { pageFrame } from "../app/page-frame";
import { componentTypesFor, componentsFor } from "../model/component-types";
import { eventAddress } from "./channel-records.query";
import { useProjectComponents } from "./component-records.query";

/**
 * Feeds a project's Components list from the API: its workflows, channels,
 * collections, and forms, artifacts, AI skills, documents and static
 * websites, each kind only with its feature flag (without Components, just
 * channels). Each kind is made on the API, and the new component opens on
 * its own page. With Build with AI, a kind can be handed to Create to draft
 * from a description instead.
 */
export default function ProjectComponentsPageQuery({ route }: { route: PageRoute }) {
  const navigate = useNavigate();
  const flags = useFlags();
  const projectId = route.params["project"];
  const { status: projectStatus, project } = useProject(projectId);
  const records = useProjectComponents(project);
  const { status: workflowsStatus, workflows } = useProjectWorkflows(projectId);
  return (
    <Loaded status={combine(projectStatus, records.status, workflowsStatus)} path={route.currentPath}>
      {() => {
        const open = (id: string) => navigate(`/projects/${project!.id}/components/${id}`);
        // Editors and up add components, as they do workflows.
        const canEdit = !!project!.permissions?.edit_workflow;
        return (
          <ProjectComponentsPage
            {...pageFrame(route, {}, project!.name)}
            data={{
              pageType: "project-components",
              projectId: project!.id,
              components: componentsFor(
                [
                  ...workflows.map((w) => ({ id: w.id, name: w.name, description: fixtureWorkflow(w.id)?.item?.description ?? "", type: "Workflow" as const })),
                  ...records.items,
                ],
                flags,
              ),
              types: componentTypesFor(flags),
            }}
            onCreateChannel={async (draft) => open(await records.channels.saves.create(draft, eventAddress(project!.name, draft.name)))}
            onCreateCollection={
              records.canManageCollections
                ? async (name) => open(await records.saves.collections.create(project!.id, name))
                : undefined
            }
            onCreateComponent={canEdit ? async (type, draft) => open(await records.saves.components.create(type, draft, starterContent(type, draft.name.trim()))) : undefined}
            // Like the editor's: drafted from a plain-words description on Create.
            onDraftWithAI={
              flags.aiBuild
                ? (type) =>
                    navigate(`/projects/${project!.id}/create`, {
                      state: { draft: `Add ${/^[aeiou]/i.test(type) ? "an" : "a"} ${type.toLowerCase()} to this project that ` },
                    })
                : undefined
            }
            channelCredentials={records.channels.credentialNames}
            channelAddress={(name) => eventAddress(project!.name, name)}
          />
        );
      }}
    </Loaded>
  );
}
