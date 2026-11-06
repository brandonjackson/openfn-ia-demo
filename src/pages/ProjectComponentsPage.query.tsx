import { useNavigate } from "react-router-dom";
import type { PageRoute } from "../app/ia-utils";
import Loaded from "../app/Loaded";
import { useFlags } from "../app/feature-flags";
import { useProject } from "../api/projects";
import { useProjectWorkflows } from "../api/workflows";
import { combine } from "../api/status";
import { fixtureProject, fixtureWorkflow } from "../fixtures/projects";
import ProjectComponentsPage from "./ProjectComponentsPage";
import { pageFrame } from "./route.fixtures";
import { componentTypesFor, componentsFor } from "./flagged.fixtures";
import { eventAddress, useProjectChannels } from "./channel-records.query";

/**
 * Feeds a project's Components list: its workflows and channels from the
 * API, and the other kinds of component from its fixture until they move too, each kind
 * only with its feature flag (without Components, just channels). A new
 * channel is made on the API and opens.
 */
export default function ProjectComponentsPageQuery({ route }: { route: PageRoute }) {
  const navigate = useNavigate();
  const flags = useFlags();
  const projectId = route.params["project"];
  const { status: projectStatus, project } = useProject(projectId);
  const { status, channels, credentialNames, saves } = useProjectChannels(projectId);
  const { status: workflowsStatus, workflows } = useProjectWorkflows(projectId);
  const others = (fixtureProject(projectId)?.components ?? []).filter((c) => c.type !== "Channel" && c.type !== "Workflow");
  return (
    <Loaded status={combine(projectStatus, status, workflowsStatus)} path={route.currentPath}>
      {() => (
        <ProjectComponentsPage
          {...pageFrame(route, {}, project!.name)}
          data={{
            pageType: "project-components",
            projectId: project!.id,
            components: componentsFor(
              [
                ...workflows.map((w) => ({ id: w.id, name: w.name, description: fixtureWorkflow(w.id)?.item?.description ?? "", type: "Workflow" as const })),
                ...channels.map((c) => c.component),
                ...others,
              ],
              flags,
            ),
            types: componentTypesFor(flags),
          }}
          // Like the editor's: drafted from a plain-words description on Create.
          onAddComponent={
            flags.aiBuild
              ? (type) =>
                  navigate(`/projects/${project!.id}/create`, {
                    state: { draft: `Add ${/^[aeiou]/i.test(type) ? "an" : "a"} ${type.toLowerCase()} to this project that ` },
                  })
              : undefined
          }
          onCreateChannel={async (draft) => {
            const id = await saves.create(draft, eventAddress(project!.name, draft.name));
            navigate(`/projects/${project!.id}/components/${id}`);
          }}
          channelCredentials={credentialNames}
          channelAddress={(name) => eventAddress(project!.name, name)}
        />
      )}
    </Loaded>
  );
}
