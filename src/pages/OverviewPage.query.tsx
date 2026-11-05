import { overviewData, statusTile } from "../fixtures/overview";
import OverviewPage from "./OverviewPage";
import Loaded from "../app/Loaded";
import { useFlags } from "../app/feature-flags";
import { useProjectList } from "../api/projects";
import { asSummary, isOpenable } from "./project-records.query";

/**
 * Feeds Overview, the home page. It sits at "/", outside the IA tree, so it
 * takes no route. Its projects come from the API; the tiles and systems are
 * still the fixtures'. Without connected systems there's no setup section;
 * without the service catalog, projects show no service counts.
 */
export default function OverviewPageQuery() {
  const flags = useFlags();
  const { status, projects } = useProjectList();
  return (
    <Loaded status={status} path="/">
      {() => (
        <OverviewPage
          data={{
            ...overviewData,
            tiles: [statusTile(flags.connectedSystems), ...overviewData.tiles.slice(1)],
            connectedSystems: flags.connectedSystems ? overviewData.connectedSystems : undefined,
            projects: projects.filter(isOpenable).map((p) => asSummary(p, flags)),
          }}
        />
      )}
    </Loaded>
  );
}
