import { Link } from "react-router-dom";
import { ArrowUpRight, Bot, Workflow } from "lucide-react";
import type { ServiceConsumer, WorkflowCatalogEntry } from "../page-data";
import Badge from "./Badge";

const consumerLabels: Record<ServiceConsumer, { label: string; icon: typeof Workflow }> = {
  workflow: { label: "Workflow step", icon: Workflow },
  mcp: { label: "MCP tool", icon: Bot },
};

interface Props {
  entry: WorkflowCatalogEntry;
}

/**
 * A published service in the catalog: links to its API page and shows how it
 * can be called, from other workflows and as an agent tool over MCP.
 */
export default function ServiceCatalogCard({ entry }: Props) {
  return (
    <Link
      to={entry.projectPath}
      className="group flex items-start gap-4 rounded-lg border border-gray-200 p-4 hover:border-blue-300 hover:shadow-sm transition-all"
    >
      <div className="w-9 h-9 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center flex-shrink-0 mt-0.5">
        <Workflow size={16} className="text-blue-500" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-medium text-gray-900 group-hover:text-blue-600 text-sm">{entry.name}</span>
          {entry.badges?.map((b) => <Badge key={b} label={b} />)}
        </div>
        <p className="mt-0.5 text-sm text-gray-500">{entry.description}</p>
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-gray-400">
          <span className="inline-flex items-center gap-1">
            <Workflow size={11} />
            {entry.project}
            <ArrowUpRight size={10} />
          </span>
          {entry.callableAs?.map((c) => (
            <Badge key={c} label={consumerLabels[c].label} icon={consumerLabels[c].icon} tone="blue" />
          ))}
          {entry.mcpToolName && <code className="font-mono text-gray-500">{entry.mcpToolName}</code>}
        </div>
      </div>
    </Link>
  );
}
