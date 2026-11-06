import { useNavigate } from "react-router-dom";
import type { PageRoute } from "../app/ia-utils";
import Loaded from "../app/Loaded";
import { useFlags } from "../app/feature-flags";
import { useConnectedSystems, useSystemSaves } from "../api/connected-systems";
import type { ListPageData } from "../model/page-data";
import { connectionOf, systemListItem } from "../model/connected-systems";
import { routeKey, type XRoadRoute } from "../model/xroad";
import { ecosystemWithoutXRoad } from "../model/ecosystem";
import { systemsPageData } from "../fixtures";
import { connectedSystems } from "../fixtures/connected-systems";
import { apiSystemId } from "../fixtures/ids";
import { directoryMember, routeService } from "../fixtures/xroad";
import SystemsPage from "./SystemsPage";
import { pageFrame } from "../app/page-frame";

/**
 * Feeds the Systems page from the demo's own connected-systems routes:
 * adding a system (by hand or from the X-Road directory) saves it, and it's
 * on the list, its page and the editor's "Connect a system" at once. The
 * ecosystem map is still placed by hand; a system deleted since leaves it.
 * Without the Ecosystem map flag there's no Ecosystem view; without X-Road,
 * no system is reached over it and there's no directory.
 */
export default function SystemsPageQuery({ route }: { route: PageRoute }) {
  const navigate = useNavigate();
  const flags = useFlags();
  const { status, systems } = useConnectedSystems();
  const saves = useSystemSaves();
  const base = systemsPageData;
  const existing = new Set(systems.map((s) => s.id));
  // The map's stations are the fixtures' systems, by slug; one deleted since leaves the map.
  const gone = new Set(connectedSystems.filter((s) => !existing.has(apiSystemId(s.id))).map((s) => s.id));
  const ecosystem = base.ecosystem && {
    ...base.ecosystem,
    stations: base.ecosystem.stations.filter((s) => !gone.has(s.id)),
    workflows: base.ecosystem.workflows.filter((w) => w.stations.every((id) => !gone.has(id))),
  };
  const added = systems.flatMap((s) => {
    const c = connectionOf(s);
    return c.method === "xroad" ? [routeKey(c.route)] : [];
  });
  const data: ListPageData = flags.xroad
    ? { ...base, items: systems.map(systemListItem), ecosystem, xroad: base.xroad && { ...base.xroad, added } }
    : {
        ...base,
        // Every system left is reached directly, so how it's reached goes unsaid.
        items: systems
          .filter((s) => connectionOf(s).method !== "xroad")
          .map(systemListItem)
          .map((item) => ({ ...item, metadata: Object.fromEntries(Object.entries(item.metadata ?? {}).filter(([key]) => key !== "connection")) })),
        ecosystem: ecosystem && ecosystemWithoutXRoad(ecosystem),
        xroad: undefined,
      };
  if (!flags.ecosystemMap) data.ecosystem = undefined;

  const addFromDirectory = async (xroadRoute: XRoadRoute) => {
    const member = directoryMember(xroadRoute.memberId);
    const service = routeService(xroadRoute);
    const blank = { url: "", credential: "" };
    await saves.addFromXRoad({
      name: service?.name ?? xroadRoute.service,
      description: `${member?.name ?? xroadRoute.memberId}, ${xroadRoute.subsystem}. Added from the X-Road directory: next, agree terms with the provider.`,
      credentialType: "org",
      hasAccess: true,
      color: "gray",
      adaptor: "http",
      owner: member?.name ?? "X-Road",
      ownerType: "org",
      environments: { production: blank, staging: blank, mock: blank },
      connection: {
        method: "xroad",
        route: xroadRoute,
        status: "discovered",
        history: [{ status: "discovered", date: new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) }],
        accessCheckedAt: "Just now",
        allowedMethods: [],
      },
    });
  };

  return (
    <Loaded status={status} path={route.currentPath}>
      {() => (
        <SystemsPage
          {...pageFrame(route)}
          data={data}
          onAddXRoadService={addFromDirectory}
          onAddSystem={async (input) => {
            const id = await saves.add({ name: input.name, description: input.description, adaptor: input.adaptor, endpointUrl: input.endpointUrl, docsUrl: input.docsUrl });
            navigate(`/connected-systems/${id}`);
          }}
        />
      )}
    </Loaded>
  );
}
