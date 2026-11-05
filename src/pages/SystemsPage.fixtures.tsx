import { useState } from "react";
import type { PageRoute } from "../app/ia-utils";
import type { ListItem, ListPageData } from "../model/page-data";
import { routeKey, type XRoadRoute } from "../model/xroad";
import { systemsPageData } from "../fixtures";
import { directoryMember, routeService } from "../fixtures/xroad";
import SystemsPage from "./SystemsPage";
import { pageFrame } from "./route.fixtures";

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

/** Feeds the Systems page from fixtures, with any X-Road services added this session. */
export default function SystemsPageFixtures({ route }: { route: PageRoute }) {
  // Services added from the X-Road directory this session: the fixtures' stand-in for the server.
  const [addedRoutes, setAddedRoutes] = useState<XRoadRoute[]>([]);
  const base = systemsPageData;
  const data: ListPageData = {
    ...base,
    items: [...base.items, ...addedRoutes.map(addedSystem)],
    xroad: base.xroad && { ...base.xroad, added: [...base.xroad.added, ...addedRoutes.map(routeKey)] },
  };

  return (
    <SystemsPage
      {...pageFrame(route)}
      data={data}
      onAddXRoadService={async (xroadRoute) => setAddedRoutes((routes) => [...routes, xroadRoute])}
    />
  );
}
