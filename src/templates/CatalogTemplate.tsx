import { Bot, Workflow } from "lucide-react";
import type { IANode } from "../ia-tree";
import type { CatalogPageData, CatalogEntry } from "../page-data";
import ChannelRow from "../components/ChannelRow";
import CodeBlock from "../components/CodeBlock";
import PageHeader from "../components/PageHeader";
import SectionHeading from "../components/SectionHeading";
import ServiceCatalogCard from "../components/ServiceCatalogCard";
import UsageModeCard from "../components/UsageModeCard";

interface Props {
  node: IANode;
  ancestors: { node: IANode; path: string }[];
  currentPath: string;
  data: CatalogPageData;
}

export default function CatalogTemplate({ node, ancestors, data }: Props) {
  const bySection = new Map<string, CatalogEntry[]>();
  for (const entry of data.entries) {
    const list = bySection.get(entry.section) ?? [];
    list.push(entry);
    bySection.set(entry.section, list);
  }
  const workflowCallable = data.entries.filter(
    (e) => e.kind === "workflow" && e.callableAs?.includes("workflow")
  ).length;
  const mcpTools = data.entries.filter((e) => e.kind === "workflow" && e.callableAs?.includes("mcp")).length;

  return (
    <div className="space-y-8">
      <PageHeader
        breadcrumbs={{
          ancestors: ancestors.map((a) => ({ label: a.node.label, path: a.path })),
          current: node.label,
        }}
        title={node.label}
        description={node.description}
      />

      {data.entries.length > 0 && (
        <div className="grid gap-3 md:grid-cols-2">
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
        </div>
      )}

      <p className="text-xs text-gray-400">
        {data.entries.length} services published across the organization
      </p>

      {[...bySection.entries()].map(([section, entries]) => (
        <section key={section}>
          <SectionHeading title={section} variant="label" />
          <div className="space-y-2">
            {entries.map((entry) =>
              entry.kind === "channel" ? (
                <ChannelRow
                  key={entry.id}
                  id={entry.id}
                  name={entry.name}
                  description={entry.description}
                  channelType={entry.channelType}
                  system={{ name: entry.system, path: entry.systemPath }}
                />
              ) : (
                <ServiceCatalogCard key={entry.id} entry={entry} />
              )
            )}
          </div>
        </section>
      ))}
    </div>
  );
}
