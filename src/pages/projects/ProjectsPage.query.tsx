import { useNavigate } from "react-router-dom";
import type { PageRoute } from "../../app/ia-utils";
import Loaded from "../../app/Loaded";
import { useAnnounce, useAnnounceOutcome } from "../../app/announce";
import { useFlags } from "../../app/feature-flags";
import { pageFrame } from "../../app/page-frame";
import { useOtherProjects, useProjectSaves, useProjectSummaries } from "../../api/projects";
import ProjectsPage from "./ProjectsPage";

/**
 * Feeds the Projects page from the API: the projects you're a member of
 * (not those being deleted), with their services' counts when the service
 * catalog is on, and a create that makes you the owner and opens the new
 * project. Make a copy is the demo's own route. With Organizations on, the
 * rest of the instance's projects come from the demo's own route too, each
 * with Request to join; they don't hold the page back, and are left out if
 * they can't load.
 */
export default function ProjectsPageQuery({ route }: { route: PageRoute }) {
  const navigate = useNavigate();
  const { serviceCatalog, organizations } = useFlags();
  const { status, projects } = useProjectSummaries(serviceCatalog);
  const { status: othersStatus, projects: otherProjects } = useOtherProjects(organizations);
  const saves = useProjectSaves();
  const announcing = useAnnounceOutcome();
  const announce = useAnnounce();
  const nameOf = (id: string) => projects.find((p) => p.id === id)?.name ?? otherProjects.find((p) => p.id === id)?.name ?? "The project";
  return (
    <Loaded status={status} path={route.currentPath}>
      {() => (
        <ProjectsPage
          {...pageFrame(route)}
          data={{ projects, ...(organizations && othersStatus.state === "ready" && { otherProjects }) }}
          onCreateProject={async ({ name, environment, description }) => {
            const project = await saves.create({ name, description, env: environment || undefined });
            navigate(`/projects/${project.id}`);
          }}
          onCopyProject={(id) =>
            announcing(
              saves.copy(id).then((made) => announce({ tone: "success", message: `Made ${made.name}.`, detail: "Its workflows are copied paused. You're its owner." })),
              { failure: `${nameOf(id)} wasn't copied` },
            )
          }
          onRequestToJoin={
            organizations
              ? (id) => announcing(saves.requestToJoin(id), { success: { message: `Asked to join ${nameOf(id)}.`, detail: "Its owner and admins will see your request." }, failure: `Your request to join ${nameOf(id)} wasn't sent` })
              : undefined
          }
        />
      )}
    </Loaded>
  );
}
