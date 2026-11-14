import { useNavigate } from "react-router-dom";
import Loaded from "../../app/Loaded";
import { useAnnounceOutcome } from "../../app/announce";
import { useFlags } from "../../app/feature-flags";
import { useProjectList, useProjectSummaries } from "../../api/projects";
import { useWorkOrders } from "../../api/work-orders";
import { combine } from "../../api/status";
import { useAdaptorCatalog, useConnectedSystems, useSystemSaves, useSystemSuggestions } from "../../api/connected-systems";
import { systemSummary } from "../../model/connected-systems";
import { insightsFor, weekTiles, withWorkOrders } from "../../model/insights";
import { isOpenable } from "../../model/projects";
import OverviewPage from "./OverviewPage";

/**
 * Feeds Overview, the home page, from the API. It sits at "/", outside the
 * IA tree, so it takes no route. The week's runs and errors are worked out
 * from the work orders of every project you can open, as Insights has them;
 * your projects, the organisation's systems and the catalog a new system is
 * picked from (the adaptor catalog, suggestions it hasn't connected) from their routes.
 * The page doesn't wait for them: the tiles appear once they're in, and
 * are left out if they can't load (a section's own loading and error
 * state is Brandon's decision 1, not built yet). Nothing in the API says
 * what isn't running right now, so there's no Status tile
 * (docs/api-gaps.md). Without connected systems there's no
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
  const announcing = useAnnounceOutcome();
  // The catalog a new system is picked from doesn't hold the page back either: it's empty until it's in.
  const { catalog } = useAdaptorCatalog(flags.connectedSystems);
  const { suggestions: suggested } = useSystemSuggestions(flags.connectedSystems);
  return (
    // The week's runs don't hold the page back: their tiles show once the work orders are in, and are left out if they can't load.
    <Loaded status={combine(status, listStatus, systemsStatus)} path="/">
      {() => (
        <OverviewPage
          data={{
            tiles: ordersStatus.state === "ready" ? weekTiles(insightsFor(withWorkOrders(mine, workOrders), "Across all projects", false)) : [],
            connectedSystems: flags.connectedSystems ? systems.map(systemSummary) : undefined,
            recommendedSystems: suggested,
            recommended: systems.length + suggested.length,
            catalog,
            projects,
          }}
          onAddSystem={async (input) => {
            // The form says why under its fields if it's refused, so only success is announced.
            const id = await announcing(systemSaves.add(input), { success: `Connected ${input.name}.` });
            navigate(`/connected-systems/${id}`);
          }}
        />
      )}
    </Loaded>
  );
}
