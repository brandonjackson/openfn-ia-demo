import { useState } from "react";
import { Bot, Network, Workflow } from "lucide-react";
import type { PageProps } from "../model/ia-tree";
import type { CatalogPageData, ChannelCatalogEntry, UsedServiceEntry, WorkflowCatalogEntry } from "../model/page-data";
import AdaptorLogo from "../components/domain/AdaptorLogo";
import Badge from "../components/primitives/Badge";
import ChannelRow from "../components/domain/ChannelRow";
import CodeBlock from "../components/primitives/CodeBlock";
import ConnectionMethodBadge from "../components/domain/ConnectionMethodBadge";
import EmptyState from "../components/primitives/EmptyState";
import ListRow from "../components/primitives/ListRow";
import PageHeader from "../components/patterns/PageHeader";
import Breadcrumbs from "../components/domain/Breadcrumbs";
import SectionHeading from "../components/primitives/SectionHeading";
import SegmentedControl from "../components/primitives/SegmentedControl";
import ServiceCatalogCard from "../components/domain/ServiceCatalogCard";
import { ClassificationBadge } from "../components/domain/ServiceRecordList";
import UsageModeCard from "../components/domain/UsageModeCard";
import XRoadAccessBadge from "../components/domain/XRoadAccessBadge";

export interface ServicesPageProps extends PageProps<CatalogPageData> {
  /** Starts a new workflow in a project, triggered by an event channel. */
  onStartWorkflow: (projectId: string, channelId: string) => void;
  /** Which view opens first. */
  initialView?: CatalogView;
}

type CatalogView = "publish" | "use";

/** Group a list by a key, keeping the order keys first appear in. */
function groupBy<T>(items: T[], key: (item: T) => string): [string, T[]][] {
  const groups = new Map<string, T[]>();
  for (const item of items) groups.set(key(item), [...(groups.get(key(item)) ?? []), item]);
  return [...groups.entries()];
}

/**
 * The organisation's services, two ways round: **Services we publish**, the
 * workflow services others can call (from a workflow, as an agent tool, or
 * over X-Road), and **Services we use**, the methods of the systems you've
 * added, including other members' services on X-Road. Only systems you've
 * added show up under "we use".
 */
export default function ServicesPage({ node, ancestors, data, initialView = "publish", onStartWorkflow }: ServicesPageProps) {
  const [view, setView] = useState<CatalogView>(initialView);
  const published = data.entries.filter((e): e is WorkflowCatalogEntry => e.kind === "workflow");
  const channels = data.entries.filter((e): e is ChannelCatalogEntry => e.kind === "channel");
  const usedServices = data.usedServices ?? [];
  const usedCount = channels.length + usedServices.length;

  const workflowCallable = published.filter((e) => e.callableAs?.includes("workflow")).length;
  const mcpTools = published.filter((e) => e.callableAs?.includes("mcp")).length;
  const onXRoad = published.filter((e) => e.callableAs?.includes("xroad")).length;

  // Everything we use, grouped by the system it comes through.
  const used: [string, { channels: ChannelCatalogEntry[]; services: UsedServiceEntry[] }][] = groupBy(
    [...usedServices.map((s) => ({ system: s.system, service: s })), ...channels.map((c) => ({ system: c.system, channel: c }))],
    (x) => x.system
  ).map(([system, items]) => [
    system,
    {
      services: items.flatMap((i) => ("service" in i ? [i.service] : [])),
      channels: items.flatMap((i) => ("channel" in i ? [i.channel] : [])),
    },
  ]);

  return (
    <div className="space-y-8">
      <PageHeader
        breadcrumbs={<Breadcrumbs ancestors={ancestors.map((a) => ({ label: a.node.label, path: a.path }))} current={node.label} />}
        title={node.label}
        description={node.description}
      />

      <SegmentedControl
        variant="pill"
        size="md"
        options={[
          { id: "publish", label: "Services we publish", count: published.length },
          { id: "use", label: "Services we use", count: usedCount },
        ]}
        value={view}
        onChange={(v) => setView(v as CatalogView)}
      />

      {view === "publish" && (
        <>
          {published.length > 0 && (
            <div className="grid gap-3 md:grid-cols-3">
              <UsageModeCard
                icon={Workflow}
                title="Call them from your workflows"
                description={`${workflowCallable} services can be dropped into any workflow as a step, so teams reuse each other's work instead of rebuilding it.`}
              />
              <UsageModeCard
                icon={Bot}
                title="Give them to your agents"
                description={`${mcpTools} services are also tools on your organization's MCP server. Point an AI agent at it and it can call them.`}
                badge="Preview"
              >
                {data.mcpServerUrl && <CodeBlock label="MCP server" code={data.mcpServerUrl} />}
              </UsageModeCard>
              <UsageModeCard
                icon={Network}
                title="Offer them over X-Road"
                description={`${onXRoad} service${onXRoad === 1 ? " is" : "s are"} published to X-Road, so other government members can call ${onXRoad === 1 ? "it" : "them"} through their Security Servers.`}
              />
            </div>
          )}

          <p className="text-xs text-gray-400">{published.length} services published across the organization</p>

          {groupBy(published, (e) => e.section).map(([section, entries]) => (
            <section key={section}>
              <SectionHeading title={section} variant="label" />
              <div className="space-y-2">
                {entries.map((entry) => (
                  <ServiceCatalogCard key={entry.id} entry={entry} />
                ))}
              </div>
            </section>
          ))}
        </>
      )}

      {view === "use" && (
        <>
          <p className="text-xs text-gray-400">
            Methods from the {used.length} systems you've added. Add a system, or a service from the X-Road directory, on
            Systems to see its methods here.
          </p>

          {used.length === 0 && <EmptyState icon={Network} title="You haven't added any systems yet." />}

          {used.map(([system, group]) => (
            <section key={system}>
              <SectionHeading title={system} variant="label" />
              <div className="space-y-2">
                {group.services.map((s) => (
                  <ListRow
                    key={s.id}
                    icon={Network}
                    logo={<AdaptorLogo adaptor={s.adaptor} name={s.system} />}
                    title={s.name}
                    to={s.systemPath}
                    badges={
                      <>
                        <ConnectionMethodBadge method={s.connection} />
                        {s.xroadStatus && <XRoadAccessBadge status={s.xroadStatus} />}
                        {s.builtWithOpenFn && <Badge label="Built with OpenFn" tone="indigo" />}
                      </>
                    }
                    description={s.description}
                    meta={
                      <>
                        <span>{s.owner}</span>
                        {s.record && <span>v{s.record.version}</span>}
                        {s.record && <ClassificationBadge classification={s.record.classification} />}
                        {s.methods.map((m) => (
                          <code key={m} className="font-mono text-gray-500">
                            {m}
                          </code>
                        ))}
                      </>
                    }
                  />
                ))}
                {group.channels.map((entry) => (
                  <ChannelRow
                    key={entry.id}
                    id={entry.id}
                    name={entry.name}
                    description={entry.description}
                    channelType={entry.channelType}
                    system={{ name: entry.system, path: entry.systemPath }}
                    projects={data.projects}
                    onStartWorkflow={onStartWorkflow}
                  />
                ))}
              </div>
            </section>
          ))}
        </>
      )}
    </div>
  );
}
