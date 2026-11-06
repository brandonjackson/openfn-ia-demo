import { Navigate, useNavigate } from "react-router-dom";
import type { PageRoute } from "../app/ia-utils";
import Loaded from "../app/Loaded";
import { useAccessGrants, useConnectedSystems, useSystemSaves } from "../api/connected-systems";
import { useProjectList } from "../api/projects";
import { combine } from "../api/status";
import type { ConnectedSystem } from "../model/connected-systems";
import type { AccessGrant } from "../model/page-data";
import { apiSystemId } from "../fixtures/ids";
import { isOpenable } from "./project-records.query";
import type { DetailPageData } from "../model/page-data";
import { connectionOf } from "../model/connected-systems";
import { connectedSystems } from "../fixtures/connected-systems";
import { directoryMember, orgXRoad, routeService } from "../fixtures/xroad";
import { serviceCatalogData } from "../fixtures/service-catalog";
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
function buildSystemDetailData(system: ConnectedSystem, accessGrants: AccessGrant[], projects: { id: string; name: string }[]): DetailPageData {
  // The service catalog's channels name the system by its fixture slug.
  const slug = connectedSystems.find((s) => apiSystemId(s.id) === system.id)?.id ?? system.id;
  const systemId = slug;

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
    xroad: xroadContext(system),
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
    accessGrants,
    projects,
  };
}

/** For a system reached over X-Road, where its route goes. */
function xroadContext(system: ConnectedSystem): DetailPageData["xroad"] {
  const connection = connectionOf(system);
  if (connection?.method !== "xroad") return undefined;
  return { org: orgXRoad, member: directoryMember(connection.route.memberId), service: routeService(connection.route) };
}

/**
 * Feeds a connected system's page from the demo's own connected-systems
 * routes: editing it, revoking access and deleting it go through them. An old
 * link by a fixture's slug still lands. A system reached over X-Road isn't
 * there without X-Road.
 */
export default function SystemPageQuery({ route }: { route: PageRoute }) {
  const navigate = useNavigate();
  const flags = useFlags();
  const id = route.params["connected-system"] ?? "";
  const { status, systems } = useConnectedSystems();
  const { status: grantsStatus, grants } = useAccessGrants(id);
  const { projects } = useProjectList();
  const saves = useSystemSaves();
  if (connectedSystems.some((s) => s.id === id)) return <Navigate to={route.currentPath.replace(id, apiSystemId(id))} replace />;
  return (
    <Loaded status={combine(status, grantsStatus)} path={route.currentPath}>
      {() => {
        const system = systemsFor(flags, systems).find((s) => s.id === id);
        if (!system) return <NotFoundPage path={route.currentPath} reason="data" />;
        return (
          <SystemPage
            {...pageFrame(route, { label: system.name, description: system.description })}
            data={buildSystemDetailData(system, grants, projects.filter((p) => isOpenable(p) && !p.parentId).map((p) => ({ id: p.id, name: p.name })))}
            onStartWorkflow={(projectId, channelId) => navigate(`/workflow-editor/new?project=${projectId}&channel=${channelId}`)}
            onRevokeGrant={(grantId) => saves.revokeGrant(system.id, grantId)}
            onSaveSystem={(changes) => saves.edit(system, changes)}
            onDeleteSystem={async () => {
              await saves.remove(system.id);
              navigate("/connected-systems");
            }}
          />
        );
      }}
    </Loaded>
  );
}
