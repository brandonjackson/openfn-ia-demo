import { useNavigate } from "react-router-dom";
import type { PageRoute } from "../app/ia-utils";
import type { DetailPageData } from "../model/page-data";
import { connectionOf } from "../model/connected-systems";
import { connectedSystems, systemAccessGrants } from "../fixtures/connected-systems";
import { directoryMember, orgXRoad, routeService } from "../fixtures/xroad";
import { serviceCatalogData } from "../fixtures/service-catalog";
import { projectOptions } from "../fixtures/projects";
import SystemPage from "./SystemPage";
import NotFoundPage from "./NotFoundPage";
import { pageFrame } from "./route.fixtures";
import { useFlags } from "../app/feature-flags";
import { systemsFor } from "./flagged.fixtures";

/**
 * Build DetailPageData on the fly from the connectedSystems array.
 * Pulls matching channels from the service catalog for the system.
 * Every system gets a "Channels" section so the default HTTP channel appears.
 */
function buildSystemDetailData(systemId: string): DetailPageData | undefined {
  const system = connectedSystems.find((s) => s.id === systemId);
  if (!system) return undefined;

  // Find channels defined in the service catalog for this system
  const systemChannels = serviceCatalogData.entries.filter(
    (e) => e.kind === "channel" && e.systemPath === `/connected-systems/${systemId}`
  );

  return {
    pageType: "detail",
    headerBadge: {
      label: system.credentialType === "org" ? "Shared" : "Private",
      variant: system.credentialType === "org" ? "shared" : "private",
    },
    system,
    xroad: xroadContext(system.id),
    sections: [
      {
        id: "channels",
        title: "Channels",
        display: "cards" as const,
        items: systemChannels.map((ch) => ({
          id: ch.id,
          name: ch.name,
          description: ch.description,
          metadata: { channelType: ch.kind === "channel" ? ch.channelType : "" },
        })),
      },
    ],
    accessGrants: systemAccessGrants[systemId] ?? [],
    projects: projectOptions,
  };
}

/** For a system reached over X-Road, where its route goes. */
function xroadContext(systemId: string): DetailPageData["xroad"] {
  const system = connectedSystems.find((s) => s.id === systemId);
  const connection = system && connectionOf(system);
  if (connection?.method !== "xroad") return undefined;
  return { org: orgXRoad, member: directoryMember(connection.route.memberId), service: routeService(connection.route) };
}

/** Feeds a connected system's page from fixtures. A system reached over X-Road isn't there without X-Road. */
export default function SystemPageFixtures({ route }: { route: PageRoute }) {
  const navigate = useNavigate();
  const flags = useFlags();
  const system = systemsFor(flags).find((s) => s.id === route.params["connected-system"]);
  const data = system && buildSystemDetailData(system.id);
  if (!system || !data) return <NotFoundPage path={route.currentPath} reason="data" />;
  return (
    <SystemPage
      {...pageFrame(route, { label: system.name, description: system.description })}
      data={data}
      onStartWorkflow={(projectId, channelId) => navigate(`/workflow-editor/new?project=${projectId}&channel=${channelId}`)}
    />
  );
}
