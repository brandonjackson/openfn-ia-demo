import { useNavigate } from "react-router-dom";
import type { PageRoute } from "../app/ia-utils";
import Loaded from "../app/Loaded";
import { useFlags } from "../app/feature-flags";
import { useProject } from "../api/projects";
import { useProjectWorkflows } from "../api/workflows";
import { useProjectServices } from "../api/services";
import { combine } from "../api/status";
import { useWorkOrders } from "../api/work-orders";
import type { WorkflowDocument } from "../model/workflow-document";
import type { ProjectDetails, ProjectComponent } from "../model/projects";
import type { FeatureFlags } from "../model/feature-flags";
import type { ProjectPageData } from "../model/page-data";
import type { ProjectServiceItem } from "../model/services";
import type { WorkOrder } from "../model/workflow";
import { activityTiles, workOrderActivity } from "../model/runs";
import { fixtureProject } from "../fixtures/projects";
import ProjectPage from "./ProjectPage";
import { pageFrame } from "../app/page-frame";
import { componentsFor } from "./flagged.fixtures";
import { asProject } from "./project-records.query";
import { asListItem, byWorkflow, LIST_PERIOD } from "../model/workflow-list";
import { useProjectChannels } from "./channel-records.query";

/**
 * A project's Overview: the project, its workflows, channels and services
 * from the API, and its other components from its fixture until those move
 * to the API (a project made on the API has none yet). The tiles and every
 * workflow row count the same work orders, the project's on the API over the
 * last 30 days, so the rows add up to the tiles and both match History.
 */
function projectPageData(details: ProjectDetails, workflows: WorkflowDocument[], workOrdersOf: (workflowId: string) => WorkOrder[], channels: ProjectComponent[], services: ProjectServiceItem[], flags: FeatureFlags): ProjectPageData {
  const project = asProject(details);
  const workOrders = workflows.flatMap((w) => workOrdersOf(w.id));
  return {
    pageType: "project",
    projectId: details.id,
    tiles: activityTiles(workOrderActivity(workOrders, LIST_PERIOD), LIST_PERIOD, `/projects/${details.id}/history`),
    workflows: workflows.map((w) => asListItem(w, workOrdersOf(w.id), flags.serviceCatalog ? services : [])).sort((a, b) => (b.lastRunAt ?? "").localeCompare(a.lastRunAt ?? "")),
    services: flags.serviceCatalog ? services : undefined,
    // Its workflows and channels from the API; other kinds of component from its fixture until they move too.
    components: flags.components
      ? componentsFor(
          [
            ...workflows.map((w): ProjectComponent => ({ id: w.id, name: w.name, description: "", type: "Workflow" })),
            ...channels,
            ...project.components.filter((c) => c.type !== "Workflow" && c.type !== "Channel"),
          ],
          flags,
        )
      : undefined,
  };
}

/** Feeds a project's Overview from the API. */
export default function ProjectPageQuery({ route }: { route: PageRoute }) {
  const navigate = useNavigate();
  const flags = useFlags();
  const { status, project } = useProject(route.params["project"]);
  const { status: workflowsStatus, workflows } = useProjectWorkflows(route.params["project"]);
  const { status: channelsStatus, channels } = useProjectChannels(route.params["project"]);
  const { status: servicesStatus, services } = useProjectServices(route.params["project"]);
  const { status: workOrdersStatus, workOrders } = useWorkOrders(route.params["project"] ? [route.params["project"]] : []);
  return (
    <Loaded status={combine(status, workflowsStatus, channelsStatus, servicesStatus, workOrdersStatus)} path={route.currentPath}>
      {() => (
        <ProjectPage
          {...pageFrame(route, { label: project!.name, description: project!.description }, project!.name)}
          data={projectPageData(project!, workflows, byWorkflow(workOrders), channels.map((c) => c.component), services, flags)}
          onNewWorkflow={() => navigate(`/workflow-editor/new?project=${fixtureProject(project!.id)?.id ?? project!.id}`)}
        />
      )}
    </Loaded>
  );
}
