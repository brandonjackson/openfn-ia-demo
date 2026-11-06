import { overviewData, statusTile } from "../fixtures/overview";
import OverviewPage from "./OverviewPage";
import Loaded from "../app/Loaded";
import { useFlags } from "../app/feature-flags";
import { useProjectList } from "../api/projects";
import { combine } from "../api/status";
import { useConnectedSystems, useSystemSaves } from "../api/connected-systems";
import { systemSummary } from "../model/connected-systems";
import { useNavigate } from "react-router-dom";
import { asSummary, isOpenable } from "./project-records.query";

/**
 * Feeds Overview, the home page. It sits at "/", outside the IA tree, so it
 * takes no route. Its projects come from the API; the tiles and systems are
 * still the fixtures'. Without connected systems there's no setup section;
 * without the service catalog, projects show no service counts.
 */
export default function OverviewPageQuery() {
  const flags = useFlags();
  const navigate = useNavigate();
  const { status, projects } = useProjectList();
  const { status: systemsStatus, systems } = useConnectedSystems();
  const systemSaves = useSystemSaves();
  return (
    <Loaded status={combine(status, systemsStatus)} path="/">
      {() => (
        <OverviewPage
          data={{
            ...overviewData,
            tiles: [statusTile(flags.connectedSystems), ...overviewData.tiles.slice(1)],
            connectedSystems: flags.connectedSystems ? systems.map(systemSummary) : undefined,
            projects: projects.filter(isOpenable).map((p) => asSummary(p, flags)),
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
