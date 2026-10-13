import { Bot, Workflow } from "lucide-react";
import type { IANode } from "../ia-tree";
import type { CatalogPageData, CatalogEntry } from "../page-data";
import Breadcrumbs from "../components/Breadcrumbs";
import ChannelCatalogCard from "../components/ChannelCatalogCard";
import CodeBlock from "../components/CodeBlock";
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
    <div>
      <Breadcrumbs
        ancestors={ancestors.map((a) => ({ label: a.node.label, path: a.path }))}
        current={node.label}
      />

      <div className="mt-6">
        <h1 className="text-2xl font-semibold text-gray-900">{node.label}</h1>
        {node.description && <p className="mt-1 text-sm text-gray-500">{node.description}</p>}
      </div>

      {data.entries.length > 0 && (
        <div className="mt-6 grid gap-3 md:grid-cols-2">
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

      <p className="mt-6 text-xs text-gray-400">
        {data.entries.length} services published across the organization
      </p>

      {[...bySection.entries()].map(([section, entries]) => (
        <div key={section} className="mt-8">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">{section}</h2>
          <div className="space-y-2">
            {entries.map((entry) =>
              entry.kind === "channel" ? (
                <ChannelCatalogCard key={entry.id} entry={entry} />
              ) : (
                <ServiceCatalogCard key={entry.id} entry={entry} />
              )
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
