import { Navigate, useNavigate } from "react-router-dom";
import type { PageRoute } from "../app/ia-utils";
import Loaded from "../app/Loaded";
import { useAccessGrants, useConnectedSystems, useSystemSaves } from "../api/connected-systems";
import { combine } from "../api/status";
import type { ConnectedSystem } from "../model/connected-systems";
import type { AccessGrant } from "../model/page-data";
import { apiSystemId } from "../fixtures/ids";
import type { DetailPageData } from "../model/page-data";
import { connectionOf } from "../model/connected-systems";
import { connectedSystems } from "../fixtures/connected-systems";
import { directoryMember, orgXRoad, routeService } from "../fixtures/xroad";
import SystemPage from "./SystemPage";
import NotFoundPage from "./NotFoundPage";
import { pageFrame } from "./route.fixtures";
import { useFlags } from "../app/feature-flags";
import { systemsFor } from "./flagged.fixtures";

/** Builds the page's data from the system, its access grants and, over X-Road, where its route goes. */
function buildSystemDetailData(system: ConnectedSystem, accessGrants: AccessGrant[]): DetailPageData {
  return {
    pageType: "detail",
    headerBadge: {
      label: system.credentialType === "org" ? "Shared" : "Private",
      variant: system.credentialType === "org" ? "shared" : "private",
    },
    system,
    xroad: xroadContext(system),
    accessGrants,
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
            data={buildSystemDetailData(system, grants)}
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
