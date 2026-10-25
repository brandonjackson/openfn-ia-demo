import { useState } from "react";
import type { RunDetails, WorkOrder } from "../../mock-data/workflow";
import DataTable from "../DataTable";
import SegmentedControl from "../SegmentedControl";
import Badge from "../Badge";
import StatusPill from "./StatusPill";

interface Props {
  workOrders: WorkOrder[];
  selectedRunId?: string;
  latestVersion?: string;
  /** Picking a run selects it; the editor then shows it on the canvas. */
  onSelectRun?: (run: RunDetails) => void;
}

const filters = ["All", "Success", "Failed", "Running"];

/**
 * The Runs view: every run of the workflow in one table, newest first, with
 * a status filter. Clicking a run selects it, so you can go back to the
 * canvas or code with it loaded.
 */
export default function RunHistoryTable({ workOrders, selectedRunId, latestVersion, onSelectRun }: Props) {
  const [filter, setFilter] = useState("All");
  const runs = workOrders
    .flatMap((o) => o.runs.map((r) => ({ run: r, retries: o.runs.length - 1 })))
    .filter(({ run }) => filter === "All" || run.status === filter.toLowerCase());

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <SegmentedControl label="Status" options={filters} value={filter} onChange={setFilter} />
        <span className="text-xs text-gray-500">
          {runs.length} {runs.length === 1 ? "run" : "runs"}
        </span>
      </div>
      <DataTable
        rows={runs}
        getRowKey={({ run }) => run.runId}
        selectedKey={selectedRunId}
        onRowClick={onSelectRun ? ({ run }) => onSelectRun(run) : undefined}
        emptyMessage="No runs match. Run the workflow to see it here."
        columns={[
          { key: "status", header: "Status", render: ({ run }) => <StatusPill status={run.status} /> },
          {
            key: "run",
            header: "Run",
            render: ({ run }) => <code className="font-mono text-xs text-gray-700">{run.runId}</code>,
          },
          {
            key: "wo",
            header: "Work order",
            render: ({ run, retries }) => (
              <span className="inline-flex items-center gap-2">
                <code className="font-mono text-xs text-gray-500">{run.workOrderId}</code>
                {retries > 0 && <span className="text-xs text-gray-400">{retries + 1} runs</span>}
              </span>
            ),
          },
          {
            key: "version",
            header: "Version",
            render: ({ run }) => (
              <Badge label={run.version} tone={latestVersion && run.version !== latestVersion ? "yellow" : "gray"} />
            ),
          },
          { key: "started", header: "Started", render: ({ run }) => <span className="text-gray-700">{run.when}</span> },
          { key: "duration", header: "Duration", render: ({ run }) => run.duration || "—" },
          { key: "by", header: "Started by", render: ({ run }) => run.startedBy },
          {
            key: "steps",
            header: "Steps",
            align: "right",
            render: ({ run }) => `${run.steps.filter((s) => s.status === "success").length}/${run.steps.length}`,
          },
        ]}
      />
    </div>
  );
}
