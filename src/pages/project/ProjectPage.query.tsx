import { useNavigate } from "react-router-dom";
import type { PageRoute } from "../../app/ia-utils";
import Loaded from "../../app/Loaded";
import { useFlags } from "../../app/feature-flags";
import { useProject } from "../../api/projects";
import { useProjectWorkflows } from "../../api/workflows";
import { useProjectServices } from "../../api/services";
import { combine } from "../../api/status";
import { useWorkOrders } from "../../api/work-orders";
import type { WorkflowDocument } from "../../model/workflow-document";
import type { ProjectDetails } from "../../model/projects";
import type { FeatureFlags } from "../../model/feature-flags";
import type { ProjectServiceItem } from "../../model/services";
import type { WorkOrder } from "../../model/workflow";
import { activityTiles, workOrderActivity } from "../../model/runs";
import { asListItem, byWorkflow, LIST_PERIOD } from "../../model/workflow-list";
import { pageFrame } from "../../app/page-frame";
import { useWorkflowListActions } from "../workflow-list.query";
import ProjectPage, { type ProjectPageData } from "./ProjectPage";

/**
 * A project's Overview, all from the API: the tiles and every workflow row
 * count the same work orders, the project's over the last 30 days, so the
 * rows add up to the tiles and both match History. With the service catalog
 * on, its services (from the demo's routes) mark which workflows are published.
 */
function projectPageData(
  details: ProjectDetails,
  workflows: WorkflowDocument[],
  workOrdersOf: (workflowId: string) => WorkOrder[],
  services: ProjectServiceItem[],
  flags: FeatureFlags,
): ProjectPageData {
  const workOrders = workflows.flatMap((w) => workOrdersOf(w.id));
  return {
    projectId: details.id,
    tiles: activityTiles(workOrderActivity(workOrders, LIST_PERIOD), LIST_PERIOD, `/projects/${details.id}/history`),
    workflows: workflows
      .map((w) => asListItem(w, workOrdersOf(w.id), flags.serviceCatalog ? services : []))
      .sort((a, b) => (b.lastRunAt ?? "").localeCompare(a.lastRunAt ?? "")),
  };
}

/** Feeds a project's Overview from the API. */
export default function ProjectPageQuery({ route }: { route: PageRoute }) {
  const navigate = useNavigate();
  const flags = useFlags();
  const projectId = route.params["project"];
  const { status, project } = useProject(projectId);
  const { status: workflowsStatus, workflows } = useProjectWorkflows(projectId);
  const { status: servicesStatus, services } = useProjectServices(projectId, flags.serviceCatalog);
  const { status: workOrdersStatus, workOrders } = useWorkOrders(projectId ? [projectId] : []);
  // Owners and admins publish a workflow as a service, with the catalog on.
  const actions = useWorkflowListActions(workflows, flags.serviceCatalog && !!project?.permissions?.edit_project);
  return (
    <Loaded status={combine(status, workflowsStatus, servicesStatus, workOrdersStatus)} path={route.currentPath}>
      {() => (
        <ProjectPage
          {...pageFrame(route, { label: project!.name, description: project!.description }, project!.name)}
          data={projectPageData(project!, workflows, byWorkflow(workOrders), services, flags)}
          onNewWorkflow={() => navigate(`/workflow-editor/new?project=${project!.id}`)}
          {...actions}
        />
      )}
    </Loaded>
  );
}
