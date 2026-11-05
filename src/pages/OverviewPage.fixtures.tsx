import { overviewData, statusTile } from "../fixtures/overview";
import OverviewPage from "./OverviewPage";
import { useFlags } from "../app/feature-flags";
import { summaryFor } from "./flagged.fixtures";

/**
 * Feeds Overview, the home page, from fixtures. It sits at "/", outside the
 * IA tree, so it takes no route. Without connected systems there's no setup
 * section; without the service catalog, projects show no service counts.
 */
export default function OverviewPageFixtures() {
  const flags = useFlags();
  return (
    <OverviewPage
      data={{
        ...overviewData,
        tiles: [statusTile(flags.connectedSystems), ...overviewData.tiles.slice(1)],
        connectedSystems: flags.connectedSystems ? overviewData.connectedSystems : undefined,
        projects: overviewData.projects.map((p) => summaryFor(p, flags)),
      }}
    />
  );
}
