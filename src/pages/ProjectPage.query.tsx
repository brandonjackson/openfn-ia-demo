import { useNavigate } from "react-router-dom";
import type { PageRoute } from "../app/ia-utils";
import Loaded from "../app/Loaded";
import { useFlags } from "../app/feature-flags";
import { useProject } from "../api/projects";
import { useProjectWorkflows } from "../api/workflows";
import { combine } from "../api/status";
import type { WorkflowDocument } from "../model/workflow-document";
import type { ProjectDetails } from "../model/projects";
import type { FeatureFlags } from "../model/feature-flags";
import type { ProjectPageData } from "../model/page-data";
import { fixtureProject } from "../fixtures/projects";
import { projectWorkOrders } from "../fixtures/history";
import { buildProjectOverviewTiles } from "../fixtures/insights";
import ProjectPage from "./ProjectPage";
import { pageFrame } from "./route.fixtures";
import { componentsFor } from "./flagged.fixtures";
import { asListItem, asProject } from "./project-records.query";

/**
 * A project's Overview: the project from the API, and its Insights tiles,
 * workflows, services and components from its fixture until those move to
 * the API (a project made on the API has none yet).
 */
function projectPageData(details: ProjectDetails, workflows: WorkflowDocument[], flags: FeatureFlags): ProjectPageData {
  const project = asProject(details);
  const slug = fixtureProject(details.id)?.id ?? details.id;
  const tiles = buildProjectOverviewTiles(slug, projectWorkOrders(project).length).map((t) => ({
    ...t,
    linkTo: t.linkTo?.replace(`/projects/${slug}`, `/projects/${details.id}`),
  }));
  return {
    pageType: "project",
    projectId: details.id,
    tiles,
    workflows: workflows.map((w) => asListItem(w, flags.serviceCatalog)).sort((a, b) => (b.lastRunAt ?? "").localeCompare(a.lastRunAt ?? "")),
    services: flags.serviceCatalog ? project.services : undefined,
    components: flags.components ? componentsFor(project.components, flags) : undefined,
  };
}

/** Feeds a project's Overview from the API. */
export default function ProjectPageQuery({ route }: { route: PageRoute }) {
  const navigate = useNavigate();
  const flags = useFlags();
  const { status, project } = useProject(route.params["project"]);
  const { status: workflowsStatus, workflows } = useProjectWorkflows(route.params["project"]);
  return (
    <Loaded status={combine(status, workflowsStatus)} path={route.currentPath}>
      {() => (
        <ProjectPage
          {...pageFrame(route, { label: project!.name, description: project!.description }, project!.name)}
          data={projectPageData(project!, workflows, flags)}
          onNewWorkflow={() => navigate(`/workflow-editor/new?project=${fixtureProject(project!.id)?.id ?? project!.id}`)}
        />
      )}
    </Loaded>
  );
}
