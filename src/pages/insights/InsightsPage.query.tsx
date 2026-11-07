import type { PageRoute } from "../../app/ia-utils";
import Loaded from "../../app/Loaded";
import { useProject, useProjectList } from "../../api/projects";
import { useWorkOrders } from "../../api/work-orders";
import { combine } from "../../api/status";
import { insightsFor } from "../../model/insights";
import { isOpenable } from "../../model/projects";
import InsightsPage from "./InsightsPage";
import { pageFrame } from "../../app/page-frame";

/**
 * Feeds Insights from the API: the last 7 days of one project's runs, or,
 * outside a project, those of every project you can open, with a row each.
 * The numbers are worked out from the projects' work orders, the same ones
 * History lists.
 */
export default function InsightsPageQuery({ route }: { route: PageRoute }) {
  const projectId = route.params["project"];
  const { status: projectStatus, project } = useProject(projectId);
  const { status: listStatus, projects: all } = useProjectList();
  const scope = projectId ? (project ? [project] : []) : all.filter((p) => isOpenable(p) && !p.parentId);
  const { status: ordersStatus, workOrders } = useWorkOrders(scope.map((p) => p.id));

  return (
    <Loaded status={combine(projectId ? projectStatus : listStatus, ordersStatus)} path={route.currentPath}>
      {() => (
        <InsightsPage
          {...pageFrame(route, {}, project?.name)}
          data={insightsFor(
            scope.map((p) => ({ id: p.id, name: p.name, workOrders: workOrders.filter((o) => o.projectId === p.id).map((o) => o.workOrder) })),
            projectId ? "This project" : "Across all projects",
            !projectId,
          )}
        />
      )}
    </Loaded>
  );
}
