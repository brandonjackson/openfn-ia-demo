import { useState } from "react";
import type { ComponentProps } from "react";
import { Check, Globe, Lock, Plus, Download, KeyRound, Sparkles, Zap } from "lucide-react";
import type { PageProps } from "../../model/ia-tree";
import type { Adaptor } from "../../model/adaptors";
import type { Ecosystem } from "../../model/ecosystem";
import AdaptorLogo from "../../components/domain/AdaptorLogo";
import Badge from "../../components/primitives/Badge";
import Button from "../../components/primitives/Button";
import Stack from "../../components/primitives/Stack";
import EcosystemView from "../../components/domain/EcosystemView";
import EmptyState from "../../components/primitives/EmptyState";
import FeatureIntro from "../../components/patterns/FeatureIntro";
import Inline from "../../components/primitives/Inline";
import ListPage from "../../components/patterns/ListPage";
import ListRow from "../../components/primitives/ListRow";
import PageHeader from "../../components/patterns/PageHeader";
import Breadcrumbs from "../../components/domain/Breadcrumbs";
import SegmentedControl from "../../components/primitives/SegmentedControl";
import SuggestedSystemsToAdd from "../../components/domain/SuggestedSystemsToAdd";
import AddConnectedSystemFlow, { type NewSystemInput } from "../../components/domain/AddConnectedSystemFlow";
import ConnectionMethodBadge from "../../components/domain/ConnectionMethodBadge";
import SectionHeading from "../../components/primitives/SectionHeading";
import XRoadAccessBadge from "../../components/domain/XRoadAccessBadge";
import XRoadDirectory from "../../components/domain/XRoadDirectory";
import type { ConnectionMethod, SuggestedSystem, SystemListItem } from "../../model/connected-systems";
import { routeKey, type XRoadConnectionStatus, type XRoadMember, type XRoadRoute } from "../../model/xroad";

/** What the Systems page shows. */
export interface SystemsPageData {
  /** The organisation's systems, as rows. */
  items: SystemListItem[];
  /** Every adaptor a new system can be connected with. */
  adaptors: Adaptor[];
  /** Systems to suggest adding, without the ones already connected. */
  suggestions: SuggestedSystem[];
  /** The organisation's systems and the workflows between them, drawn as a transport map. Absent without the Ecosystem map. */
  ecosystem?: Ecosystem;
  /** The X-Road directory, for an organisation on X-Road. */
  xroad?: {
    directory: XRoadMember[];
    /** The X-Road instance the directory is for, e.g. `FJ`. */
    instance: string;
    /** Directory services already in your systems, as `memberId/subsystem/service`. */
    added: string[];
    /** When the directory was last listed (ISO time). */
    syncedAt: string;
  };
}

/** Who can reach each system: the page's one filter, on each row's `access`. */
const accessFilter = { label: "Access", options: ["All", "You have access", "No access"] };
const accessValues: Record<string, string> = { "You have access": "yes", "No access": "no" };

const intro: ComponentProps<typeof FeatureIntro> = {
  title: "Why connect your systems?",
  storageKey: "openfn:intro:connected-systems",
  features: [
    { icon: KeyRound, title: "Connect once", description: "Org-shared credentials mean everyone on your team gets access, without sharing passwords." },
    {
      icon: Zap,
      title: "Instant value",
      description: "As soon as a system is connected you get observability, channels, mock data, and credential management out of the box.",
    },
    { icon: Sparkles, title: "Smart suggestions", description: "The more systems you connect, the smarter your service recommendations become." },
  ],
};

export interface SystemsPageProps extends PageProps<SystemsPageData> {
  /** Adds a service from the X-Road directory to your systems, with its route filled in. */
  onAddXRoadService: (route: XRoadRoute) => Promise<void>;
  /** Adds a system from the "Add connected system" form. Without it the form only pretends. */
  onAddSystem?: (system: NewSystemInput) => Promise<void>;
}

function ListItemRow({ item, basePath }: { item: SystemListItem; basePath: string }) {
  const access = item.metadata?.access;
  const connection = item.metadata?.connection as ConnectionMethod | undefined;
  const xroadStatus = item.metadata?.xroadStatus as XRoadConnectionStatus | undefined;

  return (
    <ListRow
      // A system just added from the directory has no page until it's saved.
      to={item.metadata?.justAdded ? undefined : (item.linkTo ?? `${basePath}/${item.id}`)}
      icon={Globe}
      menu={{}}
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
  const [selected, setSelected] = useState(accessFilter.options[0]!);
  const [addFlowOpen, setAddFlowOpen] = useState(false);
  const [preselectedSystem, setPreselectedSystem] = useState<string | undefined>();
  const [view, setView] = useState<"list" | "ecosystem">("list");
  const [adding, setAdding] = useState<string>();

  /** Adds a directory service to your systems, one at a time; the wrapper says why if the server refuses. */
  const addFromDirectory = async (route: XRoadRoute) => {
    if (adding) return;
    setAdding(routeKey(route));
    try {
      await onAddXRoadService(route);
    } catch {
      // Refused: the wrapper said why.
    } finally {
      setAdding(undefined);
    }
  };
  const xroad = data.xroad;

  const handleOpenAddFlow = (systemName?: string) => {
    setPreselectedSystem(systemName);
    setAddFlowOpen(true);
  };

  const filtered = data.items.filter((item) => {
    const mapped = accessValues[selected];
    if (!mapped) return true; // "All" = show everything
    return item.metadata?.access === mapped;
  });

  return (
    <>
      <ListPage
        header={
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
        }
        intro={<FeatureIntro {...intro} />}
        toolbar={
          <Inline gap="md" wrap>
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
            {view === "list" && (
              <SegmentedControl label={accessFilter.label} options={accessFilter.options} value={selected} onChange={setSelected} />
            )}
          </Inline>
        }
        isEmpty={view === "list" && filtered.length === 0}
        empty={<EmptyState icon={Globe} title="No systems match the selected filter." />}
        after={
          <>
            {xroad && (
              <section>
                <SectionHeading
                  title="Available via X-Road"
                  description="Services other members publish on X-Road, from the national directory. Add one and it joins your systems with its X-Road route already filled in."
                />
                <Stack gap="md">
                  <XRoadDirectory
                    members={xroad.directory}
                    instance={xroad.instance}
                    added={xroad.added}
                    syncedAt={xroad.syncedAt}
                    adding={adding}
                    onAdd={(route) => void addFromDirectory(route)}
                  />
                </Stack>
              </section>
            )}

            <SuggestedSystemsToAdd suggestions={data.suggestions} onSelect={handleOpenAddFlow} />
          </>
        }
      >
        {view === "ecosystem" && data.ecosystem ? (
          <EcosystemView
            stations={data.ecosystem.stations}
            workflows={data.ecosystem.workflows}
            routes={data.ecosystem.routes}
            systemHref={(id) => (data.items.some((i) => i.id === id) ? `${currentPath}/${id}` : undefined)}
          />
        ) : (
          <Stack gap="sm">
            {filtered.map((item) => (
              <ListItemRow key={item.id} item={item} basePath={currentPath} />
            ))}
          </Stack>
        )}
      </ListPage>

      <AddConnectedSystemFlow
        open={addFlowOpen}
        onClose={() => setAddFlowOpen(false)}
        adaptors={data.adaptors}
        preselectedSystem={preselectedSystem}
        onAdd={onAddSystem}
      />
    </>
  );
}
