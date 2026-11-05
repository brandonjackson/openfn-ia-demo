import { useNavigate } from "react-router-dom";
import type { PageRoute } from "../app/ia-utils";
import ProjectComponentsPage from "./ProjectComponentsPage";
import NotFoundPage from "./NotFoundPage";
import { pageFrame, routeProject } from "./route.fixtures";
import { useFlags } from "../app/feature-flags";
import { componentTypesFor, componentsFor } from "./flagged.fixtures";
import { saveChannels, useSavedChannels } from "../app/channel-state";
import { projectCredentials } from "../fixtures/adaptor-reference";
import { channelEventAddress, channelId, createChannel, fixtureChannels } from "./channel-records.fixtures";

/**
 * Feeds a project's Components list from fixtures, with the kinds of
 * component the feature flags leave: without Components, just channels.
 * Adding one goes through Create, so without it there's nothing to add from.
 */
export default function ProjectComponentsPageFixtures({ route }: { route: PageRoute }) {
  const navigate = useNavigate();
  const flags = useFlags();
  const project = routeProject(route);
  const saved = useSavedChannels(project?.id ?? "");
  if (!project) return <NotFoundPage path={route.currentPath} reason="data" />;
  // Channels made, edited or deleted this session stand in for the fixtures' own.
  const channels = saved ?? fixtureChannels(project);
  const components = componentsFor(
    [...project.components.filter((c) => c.type !== "Channel"), ...channels.map((c) => c.component)],
    flags
  );
  const types = componentTypesFor(flags);
  return (
    <ProjectComponentsPage
      {...pageFrame(route)}
      data={{ pageType: "project-components", projectId: project.id, components, types }}
      // Like the editor's: drafted from a plain-words description on Create.
      onAddComponent={
        flags.aiBuild
          ? (type) =>
              navigate(`/projects/${project.id}/create`, {
                state: { draft: `Add ${/^[aeiou]/i.test(type) ? "an" : "a"} ${type.toLowerCase()} to this project that ` },
              })
          : undefined
      }
      onCreateChannel={async (draft) => saveChannels(project.id, [...channels, createChannel(project, draft)])}
      channelCredentials={projectCredentials.map((c) => c.name)}
      channelAddress={(name) => channelEventAddress(project.id, channelId(name) || "my-channel")}
    />
  );
}
