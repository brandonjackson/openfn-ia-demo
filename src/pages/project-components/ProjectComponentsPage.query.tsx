import { useNavigate } from "react-router-dom";
import type { PageRoute } from "../../app/ia-utils";
import Loaded from "../../app/Loaded";
import { useFlags } from "../../app/feature-flags";
import { useProject } from "../../api/projects";
import { combine } from "../../api/status";
import { starterContent } from "../../model/project-components";
import { componentTypesFor, componentsFor } from "../../model/component-types";
import { useAnnounce } from "../../app/announce";
import { pageFrame } from "../../app/page-frame";
import { eventAddress } from "../channel-records.query";
import { useProjectComponents } from "../component-records.query";
import ProjectComponentsPage from "./ProjectComponentsPage";

/**
 * Feeds a project's Components list from the API: its channels and
 * collections from Lightning's, and its forms, artifacts, AI skills,
 * documents and static websites from the demo's, each kind only with its
 * feature flag (without Components, just channels). Workflows have their own
 * page, so they aren't fetched here. Each kind is made on the API, and the
 * new component opens on its own page. With Build with AI, a kind can be
 * handed to Create to draft from a description instead.
 */
export default function ProjectComponentsPageQuery({ route }: { route: PageRoute }) {
  const navigate = useNavigate();
  const flags = useFlags();
  const projectId = route.params["project"];
  const { status: projectStatus, project } = useProject(projectId);
  const records = useProjectComponents(project);
  const announce = useAnnounce();
  return (
    <Loaded status={combine(projectStatus, records.status)} path={route.currentPath}>
      {() => {
        // The new one opens, and the toast says it was made.
        const open = (id: string, name: string) => {
          announce({ tone: "success", message: `Created ${name.trim()}.` });
          navigate(`/projects/${project!.id}/components/${id}`);
        };
        const permissions = project!.permissions ?? {};
        // Editors and up add channels, as Lightning has it, and the other kinds, as they do workflows.
        const canCreate = !!permissions.create_workflow;
        return (
          <ProjectComponentsPage
            {...pageFrame(route, {}, project!.name)}
            data={{
              projectId: project!.id,
              components: componentsFor(records.items, flags),
              types: componentTypesFor(flags),
            }}
            onCreateChannel={
              permissions.create_channel
                ? async (draft) => open(await records.channels.saves.create(draft, eventAddress(project!.name, draft.name)), draft.name)
                : undefined
            }
            onCreateCollection={
              records.canManageCollections
                ? async (name) => open(await records.saves.collections.create(project!.id, name), name)
                : undefined
            }
            onCreateComponent={canCreate ? async (type, draft) => open(await records.saves.components.create(type, draft, starterContent(type, draft.name.trim())), draft.name) : undefined}
            // Like the editor's: drafted from a plain-words description on Create.
            onDraftWithAI={
              flags.aiBuild && canCreate
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
