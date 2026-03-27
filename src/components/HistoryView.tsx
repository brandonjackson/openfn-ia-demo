import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import type { IANode } from "../ia-tree";
import Breadcrumbs from "./Breadcrumbs";
import { mockEntries } from "../mock-history";

interface Props {
  node: IANode;
  ancestors: { node: IANode; path: string }[];
}

const statusColors: Record<string, string> = {
  Success: "bg-green-100 text-green-700",
  Failed: "bg-red-100 text-red-700",
  Pending: "bg-yellow-100 text-yellow-700",
};

const typeColors: Record<string, string> = {
  "Work Order": "bg-blue-50 text-blue-700",
  "Channel Request": "bg-purple-50 text-purple-700",
};

export default function HistoryView({ node, ancestors }: Props) {
  const [searchParams] = useSearchParams();
  const [projectFilter, setProjectFilter] = useState(searchParams.get("project") ?? "All Projects");
  const [typeFilter, setTypeFilter] = useState(searchParams.get("type") ?? "All");
  const [statusFilter, setStatusFilter] = useState(searchParams.get("status") ?? "All");

  const projectOptions = ["All Projects", "Project A", "Project B"];
  const typeOptions = ["All", "Work Order", "Channel Request"];
  const statusOptions = ["All", "Success", "Failed", "Pending"];

  const filtered = mockEntries.filter((entry) => {
    if (projectFilter !== "All Projects" && entry.project !== projectFilter) return false;
    if (typeFilter !== "All" && entry.type !== typeFilter) return false;
    if (statusFilter !== "All" && entry.status !== statusFilter) return false;
    return true;
  });

  return (
    <div>
      <Breadcrumbs
        ancestors={ancestors.map((a) => ({
          label: a.node.label,
          path: a.path,
        }))}
        current={node.label}
      />

      <div className="mt-6">
        <h1 className="text-2xl font-semibold text-gray-900">{node.label}</h1>
        {node.description && (
          <p className="mt-1 text-gray-500 text-sm">{node.description}</p>
        )}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-4">
        <FilterGroup label="Project" options={projectOptions} selected={projectFilter} onSelect={setProjectFilter} />
        <FilterGroup label="Type" options={typeOptions} selected={typeFilter} onSelect={setTypeFilter} />
        <FilterGroup label="Status" options={statusOptions} selected={statusFilter} onSelect={setStatusFilter} />
        <span className="text-xs text-gray-400">
          {filtered.length} result{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      <div className="mt-6 overflow-hidden rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timestamp</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filtered.map((entry) => (
              <tr key={entry.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 text-sm text-gray-400 whitespace-nowrap">{entry.id}</td>
                <td className="px-4 py-3 text-sm font-medium text-gray-900 whitespace-nowrap">{entry.name}</td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${typeColors[entry.type]}`}>
                    {entry.type}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">{entry.project}</td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[entry.status]}`}>
                    {entry.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">{entry.timestamp}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-sm text-gray-400">
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
