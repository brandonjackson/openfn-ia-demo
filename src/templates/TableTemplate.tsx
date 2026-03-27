import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import type { IANode } from "../ia-tree";
import type { TablePageData } from "../page-data";
import Breadcrumbs from "../components/Breadcrumbs";

interface Props {
  node: IANode;
  ancestors: { node: IANode; path: string }[];
  currentPath: string;
  data: TablePageData;
}

export default function TableTemplate({ node, ancestors, data }: Props) {
  const [searchParams] = useSearchParams();

  // Initialize filter state from URL params or first option
  const [filterState, setFilterState] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    for (const f of data.filters) {
      initial[f.label] = searchParams.get(f.label.toLowerCase()) ?? f.options[0];
    }
    return initial;
  });

  const filtered = data.rows.filter((row) => {
    for (const f of data.filters) {
      const selected = filterState[f.label];
      if (selected === f.options[0]) continue; // first option is "All"
      const col = data.columns.find(
        (c) => c.label === f.label || c.key === f.label.toLowerCase()
      );
      if (!col) continue;
      const cellValue = String(row[col.key] ?? "");
      if (cellValue !== selected) return false;
    }
    return true;
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

      <div className="mt-4 flex flex-wrap items-center gap-4">
        {data.filters.map((f) => (
          <FilterGroup
            key={f.label}
            label={f.label}
            options={f.options}
            selected={filterState[f.label]}
            onSelect={(v) =>
              setFilterState((prev) => ({ ...prev, [f.label]: v }))
            }
          />
        ))}
        <span className="text-xs text-gray-400">
          {filtered.length} result{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      <div className="mt-6 overflow-hidden rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {data.columns.map((col) => (
                <th
                  key={col.key}
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filtered.map((row, i) => (
              <tr key={i} className="hover:bg-gray-50 transition-colors">
                {data.columns.map((col) => {
                  const value = String(row[col.key] ?? "");
                  const colorClass = col.colorMap?.[value];
                  return (
                    <td key={col.key} className="px-4 py-3 whitespace-nowrap">
                      {colorClass ? (
                        <span
                          className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${colorClass}`}
                        >
                          {value}
                        </span>
                      ) : col.key === "name" ? (
                        <span className="text-sm font-medium text-gray-900">
                          {value}
                        </span>
                      ) : (
                        <span className="text-sm text-gray-500">{value}</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td
                  colSpan={data.columns.length}
                  className="px-4 py-8 text-center text-sm text-gray-400"
                >
                  No entries match the selected filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function FilterGroup({
  label,
  options,
  selected,
  onSelect,
}: {
  label: string;
  options: string[];
  selected: string;
  onSelect: (v: string) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-medium text-gray-500">{label}:</span>
      <div className="flex rounded-md border border-gray-200 overflow-hidden">
        {options.map((opt) => (
          <button
            key={opt}
            onClick={() => onSelect(opt)}
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
    </div>
  );
}
