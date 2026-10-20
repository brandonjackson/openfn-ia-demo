import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import type { IANode } from "../ia-tree";
import type { TablePageData } from "../page-data";
import Badge from "../components/Badge";
import DataTable from "../components/DataTable";
import type { DataTableColumn } from "../components/DataTable";
import PageHeader from "../components/PageHeader";
import SegmentedControl from "../components/SegmentedControl";

interface Props {
  node: IANode;
  ancestors: { node: IANode; path: string }[];
  currentPath: string;
  data: TablePageData;
}

type Row = TablePageData["rows"][number];

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

  const columns: DataTableColumn<Row>[] = data.columns.map((col) => ({
    key: col.key,
    header: col.label,
    render: (row) => {
      const value = String(row[col.key] ?? "");
      if (col.toneMap?.[value]) return <Badge label={value} tone={col.toneMap[value]} />;
      if (col.key === "name") return <span className="whitespace-nowrap font-medium text-gray-900">{value}</span>;
      return (
        <span className="block max-w-40 truncate whitespace-nowrap" title={value}>
          {value}
        </span>
      );
    },
  }));

  return (
    <div className="space-y-8">
      <PageHeader
        breadcrumbs={{
          ancestors: ancestors.map((a) => ({ label: a.node.label, path: a.path })),
          current: node.label,
        }}
        title={node.label}
        description={node.description}
      />

      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-4">
          {data.filters.map((f) => (
            <SegmentedControl
              key={f.label}
              label={f.label}
              options={f.options}
              value={filterState[f.label]}
              onChange={(v) => setFilterState((prev) => ({ ...prev, [f.label]: v }))}
            />
          ))}
          <span className="text-xs text-gray-400">
            {filtered.length} result{filtered.length !== 1 ? "s" : ""}
          </span>
        </div>

        <DataTable
          columns={columns}
          rows={filtered}
          getRowKey={(row) => String(row.id ?? JSON.stringify(row))}
          emptyMessage="No entries match the selected filters."
        />
      </div>
    </div>
  );
}
