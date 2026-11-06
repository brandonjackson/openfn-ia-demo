import { useState } from "react";
import { Check, Globe, Lock, Plus, Download } from "lucide-react";
import type { PageProps } from "../model/ia-tree";
import type { ListPageData, ListItem } from "../model/page-data";
import AdaptorLogo from "../components/domain/AdaptorLogo";
import Badge from "../components/primitives/Badge";
import Button from "../components/primitives/Button";
import EcosystemView from "../components/domain/EcosystemView";
import EmptyState from "../components/primitives/EmptyState";
import FeatureIntro from "../components/patterns/FeatureIntro";
import ListRow from "../components/primitives/ListRow";
import PageHeader from "../components/patterns/PageHeader";
import Breadcrumbs from "../components/domain/Breadcrumbs";
import SegmentedControl from "../components/primitives/SegmentedControl";
import SuggestedSystemsToAdd from "../components/domain/SuggestedSystemsToAdd";
import AddConnectedSystemFlow, { type NewSystemInput } from "../components/domain/AddConnectedSystemFlow";
import ConnectionMethodBadge from "../components/domain/ConnectionMethodBadge";
import SectionHeading from "../components/primitives/SectionHeading";
import XRoadAccessBadge from "../components/domain/XRoadAccessBadge";
import XRoadDirectory from "../components/domain/XRoadDirectory";
import type { ConnectionMethod } from "../model/connected-systems";
import type { XRoadConnectionStatus, XRoadRoute } from "../model/xroad";

export interface SystemsPageProps extends PageProps<ListPageData> {
  /** Adds a service from the X-Road directory to your systems, with its route filled in. */
  onAddXRoadService: (route: XRoadRoute) => Promise<void>;
  /** Adds a system from the "Add connected system" form. Without it the form only pretends. */
  onAddSystem?: (system: NewSystemInput) => Promise<void>;
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

export default function SystemsPage({ node, ancestors, currentPath, data, onAddXRoadService, onAddSystem }: SystemsPageProps) {
  const firstFilter = data.filters[0];
  const [selected, setSelected] = useState(firstFilter?.options[0] ?? "All");
  const [addFlowOpen, setAddFlowOpen] = useState(false);
  const [preselectedSystem, setPreselectedSystem] = useState<string | undefined>();
  const [view, setView] = useState<"list" | "ecosystem">("list");
  const xroad = data.xroad;

  const handleOpenAddFlow = (systemName?: string) => {
    setPreselectedSystem(systemName);
    setAddFlowOpen(true);
  };

  const filtered = data.items.filter((item) => {
    if (!data.filterKey || !data.filterMap) return true;
    const mapped = data.filterMap[selected];
    if (!mapped) return true; // "All" = show everything
    return item.metadata?.[data.filterKey] === mapped;
  });

  return (
    <div className="space-y-8">
      <PageHeader
        breadcrumbs={<Breadcrumbs ancestors={ancestors.map((a) => ({ label: a.node.label, path: a.path }))} current={node.label} />}
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

      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          {data.ecosystem && (
            <SegmentedControl
              variant="pill"
              options={[
                { id: "list", label: "List" },
                { id: "ecosystem", label: "Ecosystem" },
              ]}
              value={view}
              onChange={(v) => setView(v as "list" | "ecosystem")}
            />
          )}
          {firstFilter && view === "list" && (
            <>
              <SegmentedControl
                label={firstFilter.label}
                options={firstFilter.options}
                value={selected}
                onChange={setSelected}
              />
              <span className="text-xs text-gray-400">
                {filtered.length} system{filtered.length !== 1 ? "s" : ""}
              </span>
            </>
          )}
        </div>

        {view === "ecosystem" && data.ecosystem ? (
          <EcosystemView
            stations={data.ecosystem.stations}
            workflows={data.ecosystem.workflows}
            routes={data.ecosystem.routes}
            systemHref={(id) => (data.items.some((i) => i.id === id) ? `${currentPath}/${id}` : undefined)}
          />
        ) : filtered.length > 0 ? (
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
            instance={xroad.instance}
            added={xroad.added}
            syncedAt={xroad.syncedAt}
            onAdd={(route) => void onAddXRoadService(route)}
          />
        </section>
      )}

      {data.showSuggestions && <SuggestedSystemsToAdd onSelect={handleOpenAddFlow} />}

      <AddConnectedSystemFlow
        open={addFlowOpen}
        onClose={() => setAddFlowOpen(false)}
        adaptors={data.adaptors}
        preselectedSystem={preselectedSystem}
        onAdd={onAddSystem}
      />
    </div>
  );
}
