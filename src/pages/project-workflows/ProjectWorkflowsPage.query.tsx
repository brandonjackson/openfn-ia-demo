import { useNavigate } from "react-router-dom";
import type { PageRoute } from "../../app/ia-utils";
import Loaded from "../../app/Loaded";
import { useFlags } from "../../app/feature-flags";
import { useSelectedProject } from "../../app/sandbox-state";
import { useProjectServices } from "../../api/services";
import { useProjectWorkflows } from "../../api/workflows";
import { combine } from "../../api/status";
import { useWorkOrders } from "../../api/work-orders";
import { asListItem, byWorkflow } from "../../model/workflow-list";
import { useWorkflowListActions } from "../workflow-list.query";
import { pageFrame } from "../../app/page-frame";
import ProjectWorkflowsPage from "./ProjectWorkflowsPage";

/**
 * Feeds a project's Workflows list from the API, for the sandbox selected in
 * the project bar (main's, on main): each row is a workflow there,
 * counting its work orders there, with whether it's published as a service when
 * the catalog is on. Switching one on or off goes through its trigger, and
 * deleting marks it deleted; Make a copy is the demo's own route. api/ workflows have no description or members
 * yet, so the rows leave them out (docs/api-gaps.md).
 */
export default function ProjectWorkflowsPageQuery({ route }: { route: PageRoute }) {
  const navigate = useNavigate();
  const { serviceCatalog } = useFlags();
  const projectId = route.params["project"];
  const { status: projectStatus, project, root } = useSelectedProject(projectId);
  // The selected sandbox's own copies, with their own runs; main's when you're on main.
  const shownId = project?.id;
  const { status, workflows } = useProjectWorkflows(shownId);
  const { status: workOrdersStatus, workOrders } = useWorkOrders(shownId ? [shownId] : []);
  const { status: servicesStatus, services } = useProjectServices(shownId, serviceCatalog);
  // Owners and admins publish a workflow as a service, with the catalog on.
  // Services are published from main, never from a sandbox's copy.
  const onMain = !!root && project?.id === root.id;
  const actions = useWorkflowListActions(workflows, serviceCatalog && onMain && !!root?.permissions?.edit_project);
  const workOrdersOf = byWorkflow(workOrders);
  // Rows without service badges beat no rows: a failed services load leaves the badges out.
  const backed = servicesStatus.state === "ready" ? services : [];
  return (
    <Loaded status={combine(projectStatus, status, workOrdersStatus)} path={route.currentPath}>
      {() => (
        <ProjectWorkflowsPage
          {...pageFrame(route, {}, root!.name)}
          data={{ projectId: root!.id, workflows: workflows.map((w) => asListItem(w, workOrdersOf(w.id), backed)) }}
          onNewWorkflow={() => navigate(`/workflow-editor/new?project=${root!.id}`)}
          {...actions}
        />
      )}
    </Loaded>
  );
}
