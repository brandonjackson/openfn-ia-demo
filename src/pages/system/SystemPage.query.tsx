import { useNavigate } from "react-router-dom";
import type { PageRoute } from "../../app/ia-utils";
import Loaded from "../../app/Loaded";
import { useFlags } from "../../app/feature-flags";
import { pageFrame } from "../../app/page-frame";
import { useAccessGrants, useConnectedSystems, useSystemSaves } from "../../api/connected-systems";
import { useOrganizationXRoad, useXRoadDirectory } from "../../api/organization";
import { combine } from "../../api/status";
import { connectionOf, systemsFor } from "../../model/connected-systems";
import { findMember, findService } from "../../model/xroad";
import NotFoundPage from "../NotFoundPage";
import SystemPage from "./SystemPage";
import { useAnnounceOutcome } from "../../app/announce";

/**
 * Feeds a connected system's page from the demo's own connected-systems
 * routes: editing it, revoking access and deleting it go through them. For a
 * system reached over X-Road, the organisation's X-Road identity and the
 * directory's member and service come from the organisation's routes, and
 * are left out (not the whole page) while they load or if they can't. A
 * system reached over X-Road isn't there without X-Road. An old link by a
 * fixture's slug is sent on by the route table.
 */
export default function SystemPageQuery({ route }: { route: PageRoute }) {
  const navigate = useNavigate();
  const flags = useFlags();
  const id = route.params["connected-system"] ?? "";
  const { status, systems } = useConnectedSystems();
  const { status: grantsStatus, grants } = useAccessGrants(id);
  const system = systemsFor(flags, systems).find((s) => s.id === id);
  const connection = system && connectionOf(system);
  const overXRoad = connection?.method === "xroad";
  const { status: identityStatus, xroad: identity } = useOrganizationXRoad(overXRoad);
  const { status: directoryStatus, directory } = useXRoadDirectory(overXRoad);
  const saves = useSystemSaves();
  const announcing = useAnnounceOutcome();
  return (
    <Loaded status={combine(status, grantsStatus)} path={route.currentPath}>
      {() => {
        if (!system) return <NotFoundPage path={route.currentPath} reason="data" />;
        // The route's details are left out until the identity and the directory load, and if either can't.
        const xroad =
          connection?.method === "xroad" && identityStatus.state === "ready" && directoryStatus.state === "ready" && identity && directory
            ? {
                org: identity,
                member: findMember(directory.members, connection.route.memberId),
                service: findService(directory.members, connection.route),
              }
            : undefined;
        return (
          <SystemPage
            {...pageFrame(route, { label: system.name, description: system.description })}
            data={{ system, xroad, accessGrants: grants }}
            onRevokeGrant={(grantId) => {
              const who = grants.find((g) => g.id === grantId)?.grantedTo ?? "That grant";
              return announcing(saves.revokeGrant(system.id, grantId), { success: `${who} no longer has access to ${system.name}.`, failure: `${who} still has access` });
            }}
            // The form says why under its fields if it's refused, so only success is announced.
            onSaveSystem={(changes) => announcing(saves.edit(system, changes), { success: `Saved ${changes.name}.` })}
            onDeleteSystem={async () => {
              await announcing(saves.remove(system.id), { success: `Deleted ${system.name}.`, failure: `${system.name} wasn't deleted` });
              navigate("/connected-systems");
            }}
          />
        );
      }}
    </Loaded>
  );
}
