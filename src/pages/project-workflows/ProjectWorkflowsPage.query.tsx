import { useNavigate } from "react-router-dom";
import type { PageRoute } from "../../app/ia-utils";
import Loaded from "../../app/Loaded";
import { useFlags } from "../../app/feature-flags";
import { useProject } from "../../api/projects";
import { useProjectServices } from "../../api/services";
import { useProjectWorkflows } from "../../api/workflows";
import { combine } from "../../api/status";
import { useWorkOrders } from "../../api/work-orders";
import { asListItem, byWorkflow } from "../../model/workflow-list";
import { useWorkflowListActions } from "../workflow-list.query";
import { pageFrame } from "../../app/page-frame";
import ProjectWorkflowsPage from "./ProjectWorkflowsPage";

/**
 * Feeds a project's Workflows list from the API: each row is a workflow there,
 * counting its work orders there, with whether it's published as a service when
 * the catalog is on. Switching one on or off goes through its trigger, and
 * deleting marks it deleted; Make a copy is the demo's own route. api/ workflows have no description or members
 * yet, so the rows leave them out (docs/api-gaps.md).
 */
export default function ProjectWorkflowsPageQuery({ route }: { route: PageRoute }) {
  const navigate = useNavigate();
  const { serviceCatalog } = useFlags();
  const projectId = route.params["project"];
  const { status: projectStatus, project } = useProject(projectId);
  const { status, workflows } = useProjectWorkflows(projectId);
  const { status: workOrdersStatus, workOrders } = useWorkOrders(projectId ? [projectId] : []);
  const { status: servicesStatus, services } = useProjectServices(projectId, serviceCatalog);
  // Owners and admins publish a workflow as a service, with the catalog on.
  const actions = useWorkflowListActions(workflows, serviceCatalog && !!project?.permissions?.edit_project);
  const workOrdersOf = byWorkflow(workOrders);
  // Rows without service badges beat no rows: a failed services load leaves the badges out.
  const backed = servicesStatus.state === "ready" ? services : [];
  return (
    <Loaded status={combine(projectStatus, status, workOrdersStatus)} path={route.currentPath}>
      {() => (
        <ProjectWorkflowsPage
          {...pageFrame(route, {}, project!.name)}
          data={{ projectId: project!.id, workflows: workflows.map((w) => asListItem(w, workOrdersOf(w.id), backed)) }}
          onNewWorkflow={() => navigate(`/workflow-editor/new?project=${project!.id}`)}
          {...actions}
        />
      )}
    </Loaded>
  );
}
