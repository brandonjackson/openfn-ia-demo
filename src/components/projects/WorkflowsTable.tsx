import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import type { WorkflowStats } from "../../mock-data/dashboard-stats";
import { cn } from "../../utils/cn";
import { Table, Td, Th, Tr } from "../Table";
import Toggle from "../Toggle";
import DateTime from "../DateTime";
import Button from "../Button";
import TextLink from "../TextLink";
import WorkOrderStatus from "./WorkOrderStatus";
import { useTableSort, type SortValue } from "../useTableSort";

type SortKey = "name" | "last_workorder_updated_at" | "workorders_count" | "failed_workorders_count" | "enabled";

const sortMap: Record<SortKey, (s: WorkflowStats) => SortValue> = {
  name: (s) => s.workflow.name,
  last_workorder_updated_at: (s) => s.lastWorkOrder?.updatedAt ?? null,
  workorders_count: (s) => s.workordersCount,
  failed_workorders_count: (s) => s.failedWorkordersCount,
  enabled: (s) => s.workflow.enabled,
};

/**
 * The workflows index table (DashboardComponents.workflows_table): name and
 * last update, latest work order, work order counts (linking to History),
 * failures, the Enabled toggle, and Health / Delete. Every column but Actions
 * sorts. A row opens the workflow editor.
 */
export default function WorkflowsTable({
  stats,
  projectId,
  searchTerm = "",
  canDelete = true,
  onToggle,
  onDelete,
}: {
  stats: WorkflowStats[];
  projectId: string;
  searchTerm?: string;
  canDelete?: boolean;
  onToggle?: (workflowId: string, enabled: boolean) => void;
  onDelete?: (workflowId: string) => void;
}) {
  const navigate = useNavigate();
  const { rows, thProps } = useTableSort({ rows: stats, sortMap, initialKey: "name" });
  const history = `/projects/${projectId}/history`;

  if (stats.length === 0) {
    return (
      <p className="py-8 text-center text-gray-500">
        {searchTerm !== "" ? (
          <>
            No workflows found matching "{searchTerm}". Try a different search term or{" "}
            <TextLink to={`/projects/${projectId}/w/new`}>create a new one</TextLink>.
          </>
        ) : (
          <>
            No workflows found. <TextLink to={`/projects/${projectId}/w/new`}>Create one</TextLink> to start
            automating.
          </>
        )}
      </p>
    );
  }

  return (
    <Table
      id="workflows-table"
      header={
        <Tr>
          <Th {...thProps("name")}>Name</Th>
          <Th {...thProps("last_workorder_updated_at")}>Latest Work Order</Th>
          <Th {...thProps("workorders_count")}>Work Orders</Th>
          <Th {...thProps("failed_workorders_count")}>Work Orders in a failed state</Th>
          <Th {...thProps("enabled")}>Enabled</Th>
          <Th actions>Actions</Th>
        </Tr>
      }
    >
      {rows.map((s) => {
        const wf = s.workflow;
        return (
          <Tr key={wf.id} id={`workflow-${wf.id}`} onClick={() => navigate(`/projects/${projectId}/w/${wf.id}`)}>
            <Td className="max-w-60">
              <p
                className={cn("workflow-name truncate font-medium", wf.enabled ? "text-gray-900" : "text-gray-400")}
                title={wf.enabled ? wf.name : `${wf.name} (disabled)`}
              >
                {wf.name}
              </p>
              <p className="mt-1 text-xs">
                Updated <DateTime value={wf.updatedAt} />
              </p>
            </Td>
            <Td>
              <WorkOrderStatus state={s.lastWorkOrder?.state ?? null} updatedAt={s.lastWorkOrder?.updatedAt} />
            </Td>
            <Td>
              <Count value={s.workordersCount} to={history}>
                ({s.stepCount} steps, {s.stepSuccessRate.toFixed(1)}% success)
              </Count>
            </Td>
            <Td>
              <Count value={s.failedWorkordersCount} to={history}>
                Latest failure {s.lastFailedAt && <DateTime value={s.lastFailedAt} />}
              </Count>
            </Td>
            <Td>
              <Toggle
                checked={wf.enabled}
                onChange={(v) => onToggle?.(wf.id, v)}
                tooltip={toggleTooltip(wf.triggerType, wf.enabled)}
              />
            </Td>
            <Td>
              <div className="flex items-center gap-4">
                <Button theme="secondary" size="xs" to={`/projects/${projectId}/w/${wf.id}/health`}>
                  Health
                </Button>
                {canDelete && (
                  <Button
                    theme="secondary"
                    size="xs"
                    onClick={() => {
                      if (window.confirm("Are you sure you'd like to delete this workflow?")) onDelete?.(wf.id);
                    }}
                  >
                    Delete
                  </Button>
                )}
              </div>
            </Td>
          </Tr>
        );
      })}
    </Table>
  );
}

/** Lightning's `Helpers.workflow_state_tooltip`. */
function toggleTooltip(triggerType: string, enabled: boolean) {
  return enabled ? `This workflow is active (${triggerType} trigger enabled)` : "This workflow is inactive (manual runs only)";
}

/** A work order count linking to History with a detail line under it, or a gray 0 and "N/A". */
function Count({ value, to, children }: { value: number; to: string; children: ReactNode }) {
  return (
    <>
      <div className="text-lg">{value > 0 ? <TextLink to={to}>{value}</TextLink> : <span className="text-gray-400">0</span>}</div>
      <div className="mt-1 text-xs">{value > 0 ? children : "N/A"}</div>
    </>
  );
}
