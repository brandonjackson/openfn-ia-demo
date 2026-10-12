import { useState } from "react";
import { Check, Globe, Lock, Plus, Download } from "lucide-react";
import type { IANode } from "../ia-tree";
import type { ListPageData, ListItem } from "../page-data";
import Breadcrumbs from "../components/Breadcrumbs";
import Badge from "../components/Badge";
import ListRow from "../components/ListRow";
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
    <div>
      <Breadcrumbs
        ancestors={ancestors.map((a) => ({ label: a.node.label, path: a.path }))}
        current={node.label}
      />

      <div className="mt-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">{node.label}</h1>
          {node.description && (
            <p className="mt-1 text-gray-500 text-sm">{node.description}</p>
          )}
        </div>
        <div className="flex-shrink-0 flex items-center gap-2">
          <button className="inline-flex items-center gap-1.5 rounded-md border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            <Download size={14} />
            Export
          </button>
          <button
            onClick={() => handleOpenAddFlow()}
            className="inline-flex items-center gap-1.5 rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
          >
            <Plus size={14} />
            Add System
          </button>
        </div>
      </div>

      {firstFilter && (
        <div className="mt-4 flex items-center gap-2">
          <span className="text-xs font-medium text-gray-500">{firstFilter.label}:</span>
          <div className="flex rounded-md border border-gray-200 overflow-hidden">
            {firstFilter.options.map((opt) => (
              <button
                key={opt}
                onClick={() => setSelected(opt)}
                className={`px-3 py-1 text-xs font-medium transition-colors ${
                  selected === opt
                    ? "bg-blue-50 text-blue-700 border-blue-200"
                    : "text-gray-500 hover:bg-gray-50"
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
          <span className="text-xs text-gray-400 ml-2">
            {filtered.length} system{filtered.length !== 1 ? "s" : ""}
          </span>
        </div>
      )}

      <div className="mt-6 space-y-2">
        {filtered.map((item) => (
          <ListItemRow key={item.id} item={item} basePath={currentPath} />
        ))}
        {filtered.length === 0 && (
          <div className="rounded-lg border-2 border-dashed border-gray-200 bg-gray-50 p-8 text-center text-gray-400">
            No systems match the selected filter.
          </div>
        )}
      </div>

      {data.showSuggestions && (
        <div className="mt-8">
          <SuggestedSystemsToAdd onSelect={handleOpenAddFlow} />
        </div>
      )}

      <AddConnectedSystemFlow
        open={addFlowOpen}
        onClose={() => setAddFlowOpen(false)}
        preselectedSystem={preselectedSystem}
      />
    </div>
  );
}
