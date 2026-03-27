import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, Globe, Lock, Users } from "lucide-react";
import type { IANode } from "../ia-tree";
import type { ListPageData, ListItem } from "../page-data";
import Breadcrumbs from "../components/Breadcrumbs";
import SuggestedSystemsToAdd from "../components/SuggestedSystemsToAdd";

interface Props {
  node: IANode;
  ancestors: { node: IANode; path: string }[];
  currentPath: string;
  data: ListPageData;
}

function ListItemCard({ item, basePath }: { item: ListItem; basePath: string }) {
  const to = item.linkTo ?? `${basePath}/${item.id}`;
  const credentialType = item.metadata?.credentialType;

  return (
    <Link
      to={to}
      className="group flex items-center gap-4 rounded-lg border border-gray-200 p-4 hover:border-blue-300 hover:shadow-sm transition-all"
    >
      <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-50">
        <Globe size={20} className="text-gray-400 group-hover:text-blue-500" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="font-medium text-gray-900 group-hover:text-blue-600 text-sm">
            {item.name}
          </h3>
          {credentialType === "user" ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
              <Lock size={10} />
              Private
            </span>
          ) : credentialType === "org" ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-xs text-blue-600">
              <Users size={10} />
              Shared
            </span>
          ) : null}
        </div>
        <p className="mt-0.5 text-sm text-gray-500 truncate">{item.description}</p>
      </div>
      <ChevronRight
        size={16}
        className="text-gray-300 group-hover:text-blue-400 flex-shrink-0"
      />
    </Link>
  );
}

export default function ListTemplate({ node, ancestors, currentPath, data }: Props) {
  const firstFilter = data.filters[0];
  const [selected, setSelected] = useState(firstFilter?.options[0] ?? "All");

  const filtered = data.items.filter((item) => {
    if (!data.filterKey || !data.filterMap) return true;
    const mapped = data.filterMap[selected];
    if (!mapped) return true; // "Available" or similar = show all
    return item.metadata?.[data.filterKey] === mapped;
  });

  return (
    <div>
      <Breadcrumbs
        ancestors={ancestors.map((a) => ({ label: a.node.label, path: a.path }))}
        current={node.label}
      />

      <div className="mt-6">
        <h1 className="text-2xl font-semibold text-gray-900">{node.label}</h1>
        {node.description && (
          <p className="mt-1 text-gray-500 text-sm">{node.description}</p>
        )}
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
          <ListItemCard key={item.id} item={item} basePath={currentPath} />
        ))}
        {filtered.length === 0 && (
          <div className="rounded-lg border-2 border-dashed border-gray-200 bg-gray-50 p-8 text-center text-gray-400">
            No systems match the selected filter.
          </div>
        )}
      </div>

      {data.showSuggestions && (
        <div className="mt-8">
          <SuggestedSystemsToAdd />
        </div>
      )}
    </div>
  );
}
