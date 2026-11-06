import { useNavigate } from "react-router-dom";
import type { PageRoute } from "../app/ia-utils";
import Loaded from "../app/Loaded";
import { useFlags } from "../app/feature-flags";
import { useProject } from "../api/projects";
import { useProjectWorkflows, useWorkflowSaves } from "../api/workflows";
import { combine } from "../api/status";
import { useWorkOrders } from "../api/work-orders";
import { fixtureProject } from "../fixtures/projects";
import ProjectWorkflowsPage from "./ProjectWorkflowsPage";
import { pageFrame } from "./route.fixtures";
import { asListItem, byWorkflow } from "./project-records.query";

/** Feeds a project's Workflows list from the API, each row counting its work orders there: switching one on or off goes through its trigger, and deleting marks it deleted. */
export default function ProjectWorkflowsPageQuery({ route }: { route: PageRoute }) {
  const navigate = useNavigate();
  const flags = useFlags();
  const projectId = route.params["project"];
  const { status: projectStatus, project } = useProject(projectId);
  const { status, workflows } = useProjectWorkflows(projectId);
  const { status: workOrdersStatus, workOrders } = useWorkOrders(projectId ? [projectId] : []);
  const saves = useWorkflowSaves();
  const docOf = (id: string) => workflows.find((w) => w.id === id)!;
  return (
    <Loaded status={combine(projectStatus, status, workOrdersStatus)} path={route.currentPath}>
      {() => (
        <ProjectWorkflowsPage
          {...pageFrame(route, {}, project!.name)}
          data={{ pageType: "project-workflows", projectId: project!.id, workflows: workflows.map((w) => asListItem(w, flags.serviceCatalog, byWorkflow(workOrders)(w.id))) }}
          onNewWorkflow={() => navigate(`/workflow-editor/new?project=${fixtureProject(project!.id)?.id ?? project!.id}`)}
          onToggleWorkflow={(id, on) => saves.setEnabled(docOf(id), on)}
          onDeleteWorkflow={(id) => saves.remove(docOf(id))}
        />
      )}
    </Loaded>
  );
}
