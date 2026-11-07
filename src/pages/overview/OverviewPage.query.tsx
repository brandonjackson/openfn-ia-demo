import { useNavigate } from "react-router-dom";
import Loaded from "../../app/Loaded";
import { useFlags } from "../../app/feature-flags";
import { useProjectList, useProjectSummaries } from "../../api/projects";
import { useWorkOrders } from "../../api/work-orders";
import { combine } from "../../api/status";
import { useConnectedSystems, useSystemSaves } from "../../api/connected-systems";
import { systemSummary } from "../../model/connected-systems";
import { insightsFor, weekTiles } from "../../model/insights";
import { isOpenable } from "../../model/projects";
// debt: the catalog a new system is picked from (adaptors, suggested systems) isn't on the API yet; it's lane 5's (docs/convergence.md).
import { recommendedSystems } from "../../fixtures/connected-systems";
import { adaptors } from "../../fixtures/adaptors";
import OverviewPage from "./OverviewPage";

/**
 * Feeds Overview, the home page, from the API. It sits at "/", outside the
 * IA tree, so it takes no route. The week's runs and errors are worked out
 * from the work orders of every project you can open, as Insights has them;
 * your projects and the organisation's systems come from their routes.
 * Nothing in the API says what isn't running right now, so there's no
 * Status tile (docs/api-gaps.md). Without connected systems there's no
 * setup section; without the service catalog, projects show no service
 * counts.
 */
export default function OverviewPageQuery() {
  const flags = useFlags();
  const navigate = useNavigate();
  const { status, projects } = useProjectSummaries(flags.serviceCatalog);
  const { status: listStatus, projects: all } = useProjectList();
  const mine = all.filter((p) => isOpenable(p) && !p.parentId);
  const { status: ordersStatus, workOrders } = useWorkOrders(mine.map((p) => p.id));
  const { status: systemsStatus, systems } = useConnectedSystems();
  const systemSaves = useSystemSaves();
  const suggested = recommendedSystems.filter((r) => !systems.some((s) => s.name.toLowerCase() === r.name.toLowerCase()));
  return (
    <Loaded status={combine(status, listStatus, ordersStatus, systemsStatus)} path="/">
      {() => (
        <OverviewPage
          data={{
            tiles: weekTiles(
              insightsFor(
                mine.map((p) => ({ id: p.id, name: p.name, workOrders: workOrders.filter((o) => o.projectId === p.id).map((o) => o.workOrder) })),
                "Across all projects",
                false,
              ),
            ),
            connectedSystems: flags.connectedSystems ? systems.map(systemSummary) : undefined,
            recommendedSystems: suggested,
            recommended: systems.length + suggested.length,
            adaptors,
            projects,
          }}
          onAddSystem={async (input) => {
            const id = await systemSaves.add({ name: input.name, description: input.description, adaptor: input.adaptor, endpointUrl: input.endpointUrl, docsUrl: input.docsUrl });
            navigate(`/connected-systems/${id}`);
          }}
        />
      )}
    </Loaded>
  );
}
