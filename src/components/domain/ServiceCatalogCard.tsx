import { ArrowUpRight, Bot, Network, Workflow } from "lucide-react";
import type { ServiceConsumer, WorkflowCatalogEntry } from "../../model/services";
import Badge from "../primitives/Badge";
import ListRow from "../primitives/ListRow";
import type { ListRowMenu } from "../primitives/ListRow";

const consumerLabels: Record<ServiceConsumer, { label: string; icon: typeof Workflow }> = {
  workflow: { label: "Workflow step", icon: Workflow },
  mcp: { label: "MCP tool", icon: Bot },
  xroad: { label: "X-Road service", icon: Network },
};

interface Props {
  entry: WorkflowCatalogEntry;
  /** Actions for its ⋮ menu, after Open. */
  menu?: ListRowMenu;
}

/**
 * A published service in the catalog: links to its API page and shows how it
 * can be called (from other workflows, as an agent tool over MCP, by other
 * members over X-Road) and how much it's used.
 */
export default function ServiceCatalogCard({ entry, menu = {} }: Props) {
  return (
    <ListRow
      icon={Workflow}
      title={entry.name}
      to={entry.projectPath}
      menu={menu}
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
          {entry.usage && (
            <span>
              {entry.usage.organisations} organisation{entry.usage.organisations === 1 ? "" : "s"} ·{" "}
              {entry.usage.calls30d.toLocaleString()} calls in 30 days
            </span>
          )}
        </>
      }
    />
  );
}
