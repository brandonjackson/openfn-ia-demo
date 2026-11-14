import { useNavigate } from "react-router-dom";
import type { PageRoute } from "../../app/ia-utils";
import Loaded from "../../app/Loaded";
import { useFlags } from "../../app/feature-flags";
import { pageFrame } from "../../app/page-frame";
import { useAdaptors, useConnectedSystems, useEcosystem, useSystemSaves, useSystemSuggestions } from "../../api/connected-systems";
import { useOrganizationXRoad, useXRoadDirectory } from "../../api/organization";
import { connectionOf, isXRoadSystem, systemListItem } from "../../model/connected-systems";
import { ecosystemWithoutXRoad } from "../../model/ecosystem";
import { findMember, findService, routeKey, type XRoadRoute } from "../../model/xroad";
import SystemsPage, { type SystemsPageData } from "./SystemsPage";

/**
 * Feeds the Systems page from the demo's own routes: the organisation's
 * systems, the adaptors a new one can use, the ecosystem map and, on X-Road,
 * the directory. Adding a system (by hand or from the directory) saves it,
 * and it's on the list, its page and the editor's "Add a step" at once.
 * The list doesn't wait for the catalog, the map or the directory; each is
 * left out until it's in, or if it can't load. It suggests three systems, as
 * it always has. Without the Ecosystem map flag there's no map; without
 * X-Road, no system is reached over it and there's no directory, and the
 * directory waits for the organisation to be connected to X-Road (to have an
 * X-Road identity): one that isn't, as beside Lightning, has none to show.
 */
export default function SystemsPageQuery({ route }: { route: PageRoute }) {
  const navigate = useNavigate();
  const flags = useFlags();
  const { status, systems } = useConnectedSystems();
  // The catalog, the map and the directory don't hold the list back: each shows once it's in, and is left out if it can't load.
  const { adaptors } = useAdaptors();
  const { suggestions } = useSystemSuggestions();
  const { ecosystem } = useEcosystem(flags.ecosystemMap);
  const { xroad: identity } = useOrganizationXRoad(flags.xroad);
  const { directory } = useXRoadDirectory(flags.xroad);
  const saves = useSystemSaves();

  const addFromDirectory = async (xroadRoute: XRoadRoute) => {
    const member = directory && findMember(directory.members, xroadRoute.memberId);
    const service = directory && findService(directory.members, xroadRoute);
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
      {() => {
        const data: SystemsPageData = flags.xroad
          ? {
              items: systems.map(systemListItem),
              adaptors,
              suggestions: suggestions.slice(0, 3),
              ecosystem,
              // Only an organisation connected to X-Road has a directory to add from.
              xroad: identity && directory && {
                directory: directory.members,
                instance: directory.instance,
                added: systems.flatMap((s) => {
                  const c = connectionOf(s);
                  return c.method === "xroad" ? [routeKey(c.route)] : [];
                }),
                syncedAt: directory.syncedAt,
              },
            }
          : {
              // Every system left is reached directly, so how it's reached goes unsaid.
              items: systems
                .filter((s) => !isXRoadSystem(s))
                .map(systemListItem)
                .map((item) => ({ ...item, metadata: Object.fromEntries(Object.entries(item.metadata ?? {}).filter(([key]) => key !== "connection")) })),
              adaptors,
              suggestions: suggestions.slice(0, 3),
              ecosystem: ecosystem && ecosystemWithoutXRoad(ecosystem),
            };
        return (
          <SystemsPage
            {...pageFrame(route)}
            data={data}
            onAddXRoadService={addFromDirectory}
            onAddSystem={async (input) => {
              const id = await saves.add({ name: input.name, description: input.description, adaptor: input.adaptor, endpointUrl: input.endpointUrl, docsUrl: input.docsUrl });
              navigate(`/connected-systems/${id}`);
            }}
          />
        );
      }}
    </Loaded>
  );
}
