import { ArrowUpRight, Bot, Workflow } from "lucide-react";
import type { ServiceConsumer, WorkflowCatalogEntry } from "../page-data";
import Badge from "./Badge";
import ListRow from "./ListRow";

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
    <ListRow
      icon={Workflow}
      title={entry.name}
      to={entry.projectPath}
      badges={entry.badges?.map((b) => <Badge key={b} label={b} />)}
      description={entry.description}
      meta={
        <>
          <span className="inline-flex items-center gap-1">
            <Workflow size={11} />
            {entry.project}
            <ArrowUpRight size={10} />
          </span>
          {entry.callableAs?.map((c) => (
            <Badge key={c} label={consumerLabels[c].label} icon={consumerLabels[c].icon} tone="indigo" />
          ))}
          {entry.mcpToolName && <code className="font-mono text-gray-500">{entry.mcpToolName}</code>}
        </>
      }
    />
  );
}
