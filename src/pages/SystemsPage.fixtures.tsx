import { useState } from "react";
import type { PageRoute } from "../app/ia-utils";
import type { ListItem, ListPageData } from "../model/page-data";
import { routeKey, type XRoadRoute } from "../model/xroad";
import { systemsPageData } from "../fixtures";
import { directoryMember, routeService } from "../fixtures/xroad";
import SystemsPage from "./SystemsPage";
import { pageFrame } from "./route.fixtures";
import { ecosystemWithoutXRoad } from "../model/ecosystem";
import { useFlags } from "../app/feature-flags";

/** A system just added from the X-Road directory: it has a route, but no agreement or page yet. */
function addedSystem(route: XRoadRoute): ListItem {
  const member = directoryMember(route.memberId);
  const service = routeService(route);
  return {
    id: `xroad-${routeKey(route)}`,
    name: service?.name ?? route.service,
    description: `${member?.name ?? route.memberId}, ${route.subsystem}. Just added from the X-Road directory: next, agree terms with the provider.`,
    metadata: { connection: "xroad", xroadStatus: "discovered", adaptor: "http", justAdded: "true" },
  };
}

/**
 * Feeds the Systems page from fixtures, with any X-Road services added this
 * session. Without the Ecosystem map flag there's no Ecosystem view; without
 * X-Road, no system is reached over it and there's no directory.
 */
export default function SystemsPageFixtures({ route }: { route: PageRoute }) {
  // Services added from the X-Road directory this session: the fixtures' stand-in for the server.
  const [addedRoutes, setAddedRoutes] = useState<XRoadRoute[]>([]);
  const flags = useFlags();
  const base = systemsPageData;
  const data: ListPageData = flags.xroad
    ? {
        ...base,
        items: [...base.items, ...addedRoutes.map(addedSystem)],
        xroad: base.xroad && { ...base.xroad, added: [...base.xroad.added, ...addedRoutes.map(routeKey)] },
      }
    : {
        ...base,
        // Every system left is reached directly, so how it's reached goes unsaid.
        items: base.items
          .filter((item) => item.metadata?.connection !== "xroad")
          .map((item) => ({
            ...item,
            metadata: Object.fromEntries(Object.entries(item.metadata ?? {}).filter(([key]) => key !== "connection")),
          })),
        ecosystem: base.ecosystem && ecosystemWithoutXRoad(base.ecosystem),
        xroad: undefined,
      };
  if (!flags.ecosystemMap) data.ecosystem = undefined;

  return (
    <SystemsPage
      {...pageFrame(route)}
      data={data}
      onAddXRoadService={async (xroadRoute) => setAddedRoutes((routes) => [...routes, xroadRoute])}
    />
  );
}
