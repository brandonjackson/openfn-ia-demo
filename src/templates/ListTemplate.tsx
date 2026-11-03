import { useState } from "react";
import { Check, Globe, Lock, Plus, Download } from "lucide-react";
import type { IANode } from "../ia-tree";
import type { ListPageData, ListItem } from "../page-data";
import AdaptorLogo from "../components/AdaptorLogo";
import Badge from "../components/Badge";
import Button from "../components/Button";
import EmptyState from "../components/EmptyState";
import FeatureIntro from "../components/FeatureIntro";
import ListRow from "../components/ListRow";
import PageHeader from "../components/PageHeader";
import SegmentedControl from "../components/SegmentedControl";
import SuggestedSystemsToAdd from "../components/SuggestedSystemsToAdd";
import AddConnectedSystemFlow from "../components/AddConnectedSystemFlow";
import ConnectionMethodBadge from "../components/ConnectionMethodBadge";
import Modal from "../components/Modal";
import SectionHeading from "../components/SectionHeading";
import XRoadAccessBadge from "../components/XRoadAccessBadge";
import XRoadDirectory from "../components/XRoadDirectory";
import XRoadNetworkMap from "../components/XRoadNetworkMap";
import type { ConnectionMethod } from "../mock-data/connected-systems";
import type { XRoadConnectionStatus, XRoadRoute } from "../mock-data/xroad";
import { directoryMember, routeKey, routeService } from "../mock-data/xroad";

interface Props {
  node: IANode;
  ancestors: { node: IANode; path: string }[];
  currentPath: string;
  data: ListPageData;
}

function ListItemRow({ item, basePath }: { item: ListItem; basePath: string }) {
  const access = item.metadata?.access;
  const connection = item.metadata?.connection as ConnectionMethod | undefined;
  const xroadStatus = item.metadata?.xroadStatus as XRoadConnectionStatus | undefined;

  return (
    <ListRow
      // A system just added from the directory has no page until it's saved.
      to={item.metadata?.justAdded ? undefined : (item.linkTo ?? `${basePath}/${item.id}`)}
      icon={Globe}
      logo={item.metadata?.adaptor && <AdaptorLogo adaptor={item.metadata.adaptor} name={item.name} />}
      title={item.name}
      badges={
        <>
          {connection && <ConnectionMethodBadge method={connection} />}
          {xroadStatus ? (
            // On X-Road, access follows the connection's status.
            <XRoadAccessBadge status={xroadStatus} />
          ) : access === "yes" ? (
            <Badge label="You have access" tone="green" icon={Check} />
          ) : access === "no" ? (
            <Badge label="No access" tone="gray" icon={Lock} />
          ) : null}
        </>
      }
      description={item.description}
      meta={item.metadata?.url && <span className="truncate">{item.metadata.url}</span>}
    />
  );
}

export default function ListTemplate({ node, ancestors, currentPath, data }: Props) {
  const firstFilter = data.filters[0];
  const [selected, setSelected] = useState(firstFilter?.options[0] ?? "All");
  const [addFlowOpen, setAddFlowOpen] = useState(false);
  const [preselectedSystem, setPreselectedSystem] = useState<string | undefined>();
  const [mapOpen, setMapOpen] = useState(false);
  // Services added from the X-Road directory this session.
  const [addedRoutes, setAddedRoutes] = useState<XRoadRoute[]>([]);
  const xroad = data.xroad;
  const added = [...(xroad?.added ?? []), ...addedRoutes.map(routeKey)];
  const network = xroad?.network.map((m) =>
    m.linked || !addedRoutes.some((r) => r.memberId === m.id) ? m : { ...m, linked: true, direction: "outbound" as const }
  );
  const addedItems: ListItem[] = addedRoutes.map((route) => {
    const member = directoryMember(route.memberId);
    const service = routeService(route);
    return {
      id: `xroad-${routeKey(route)}`,
      name: service?.name ?? route.service,
      description: `${member?.name ?? route.memberId}, ${route.subsystem}. Just added from the X-Road directory: next, agree terms with the provider.`,
      metadata: { connection: "xroad", xroadStatus: "discovered", adaptor: "http", justAdded: "true" },
    };
  });

  const handleOpenAddFlow = (systemName?: string) => {
    setPreselectedSystem(systemName);
    setAddFlowOpen(true);
  };

  const filtered = [...data.items, ...addedItems].filter((item) => {
    if (!data.filterKey || !data.filterMap) return true;
    const mapped = data.filterMap[selected];
    if (!mapped) return true; // "All" = show everything
    return item.metadata?.[data.filterKey] === mapped;
  });

  return (
    <div className="space-y-8">
      <PageHeader
        breadcrumbs={{
          ancestors: ancestors.map((a) => ({ label: a.node.label, path: a.path })),
          current: node.label,
        }}
        title={node.label}
        description={node.description}
        actions={
          <>
            <Button variant="secondary" size="sm" icon={Download}>
              Export
            </Button>
            <Button size="sm" icon={Plus} onClick={() => handleOpenAddFlow()}>
              Add system
            </Button>
          </>
        }
      />

      {data.intro && <FeatureIntro {...data.intro} />}

      {xroad && network && (
        <XRoadNetworkMap centre={xroad.centre} members={network} variant="mini" onExpand={() => setMapOpen(true)} />
      )}

      <div className="space-y-4">
        {firstFilter && (
          <div className="flex items-center gap-4">
            <SegmentedControl
              label={firstFilter.label}
              options={firstFilter.options}
              value={selected}
              onChange={setSelected}
            />
            <span className="text-xs text-gray-400">
              {filtered.length} system{filtered.length !== 1 ? "s" : ""}
            </span>
          </div>
        )}

        {filtered.length > 0 ? (
          <div className="space-y-2">
            {filtered.map((item) => (
              <ListItemRow key={item.id} item={item} basePath={currentPath} />
            ))}
          </div>
        ) : (
          <EmptyState icon={Globe} title="No systems match the selected filter." />
        )}
      </div>

      {xroad && (
        <section>
          <SectionHeading
            title="Available via X-Road"
            description="Services other members publish on X-Road, from the national directory. Add one and it joins your systems with its X-Road route already filled in."
          />
          <XRoadDirectory
            members={xroad.directory}
            added={added}
            syncedAt={xroad.syncedAt}
            onAdd={(route) => setAddedRoutes((routes) => [...routes, route])}
          />
        </section>
      )}

      {data.showSuggestions && <SuggestedSystemsToAdd onSelect={handleOpenAddFlow} />}

      {xroad && network && (
        <Modal open={mapOpen} onClose={() => setMapOpen(false)} title="X-Road network" widthClass="max-w-4xl">
          <XRoadNetworkMap centre={xroad.centre} members={network} variant="full" />
        </Modal>
      )}

      <AddConnectedSystemFlow
        open={addFlowOpen}
        onClose={() => setAddFlowOpen(false)}
        preselectedSystem={preselectedSystem}
      />
    </div>
  );
}
