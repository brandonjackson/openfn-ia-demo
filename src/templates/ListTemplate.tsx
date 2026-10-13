import { useState } from "react";
import { Check, Globe, Lock, Plus, Download } from "lucide-react";
import type { IANode } from "../ia-tree";
import type { ListPageData, ListItem } from "../page-data";
import Badge from "../components/Badge";
import Button from "../components/Button";
import EmptyState from "../components/EmptyState";
import ListRow from "../components/ListRow";
import PageHeader from "../components/PageHeader";
import SegmentedControl from "../components/SegmentedControl";
import SuggestedSystemsToAdd from "../components/SuggestedSystemsToAdd";
import AddConnectedSystemFlow from "../components/AddConnectedSystemFlow";

interface Props {
  node: IANode;
  ancestors: { node: IANode; path: string }[];
  currentPath: string;
  data: ListPageData;
}

function ListItemRow({ item, basePath }: { item: ListItem; basePath: string }) {
  const access = item.metadata?.access;

  return (
    <ListRow
      to={item.linkTo ?? `${basePath}/${item.id}`}
      icon={Globe}
      title={item.name}
      badges={
        access === "yes" ? (
          <Badge label="You have access" tone="green" icon={Check} />
        ) : access === "no" ? (
          <Badge label="No access" tone="gray" icon={Lock} />
        ) : null
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

      {data.showSuggestions && <SuggestedSystemsToAdd onSelect={handleOpenAddFlow} />}

      <AddConnectedSystemFlow
        open={addFlowOpen}
        onClose={() => setAddFlowOpen(false)}
        preselectedSystem={preselectedSystem}
      />
    </div>
  );
}
