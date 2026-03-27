import { useState } from "react";
import type { IANode } from "../ia-tree";
import Breadcrumbs from "./Breadcrumbs";

interface Props {
  node: IANode;
  ancestors: { node: IANode; path: string }[];
}

interface WorkOrder {
  id: number;
  name: string;
  project: string;
  status: "Success" | "Failed" | "Pending";
  timestamp: string;
}

const mockWorkOrders: WorkOrder[] = [
  { id: 1, name: "Sync patient records", project: "Project A", status: "Success", timestamp: "2026-03-27 09:12" },
  { id: 2, name: "Import survey responses", project: "Project B", status: "Success", timestamp: "2026-03-27 08:45" },
  { id: 3, name: "Push facility data", project: "Project A", status: "Failed", timestamp: "2026-03-27 08:30" },
  { id: 4, name: "Transform case data", project: "Project A", status: "Success", timestamp: "2026-03-27 07:55" },
  { id: 5, name: "Export analytics report", project: "Project B", status: "Pending", timestamp: "2026-03-27 07:20" },
  { id: 6, name: "Sync inventory levels", project: "Project A", status: "Success", timestamp: "2026-03-26 23:00" },
  { id: 7, name: "Update contact records", project: "Project B", status: "Failed", timestamp: "2026-03-26 22:15" },
];

const statusColors: Record<string, string> = {
  Success: "bg-green-100 text-green-700",
  Failed: "bg-red-100 text-red-700",
  Pending: "bg-yellow-100 text-yellow-700",
};

export default function HistoryView({ node, ancestors }: Props) {
  const [projectFilter, setProjectFilter] = useState("All Projects");
  const [statusFilter, setStatusFilter] = useState("All");

  const projectOptions = ["All Projects", "Project A", "Project B"];
  const statusOptions = ["All", "Success", "Failed", "Pending"];

  const filtered = mockWorkOrders.filter((wo) => {
    if (projectFilter !== "All Projects" && wo.project !== projectFilter) return false;
    if (statusFilter !== "All" && wo.status !== statusFilter) return false;
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
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Work Order</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timestamp</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filtered.map((wo) => (
              <tr key={wo.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 text-sm text-gray-400 whitespace-nowrap">{wo.id}</td>
                <td className="px-4 py-3 text-sm font-medium text-gray-900 whitespace-nowrap">{wo.name}</td>
                <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">{wo.project}</td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[wo.status]}`}>
                    {wo.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">{wo.timestamp}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-sm text-gray-400">
                  No work orders match the selected filters.
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
