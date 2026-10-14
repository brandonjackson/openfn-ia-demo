import { Link, useNavigate } from "react-router-dom";
import type { WorkflowStats } from "../../mock-data/dashboard-stats";
import { cn } from "../../utils/cn";
import { Table, Td, Th, Tr } from "../Table";
import Toggle from "../Toggle";
import RelativeTime from "./RelativeTime";
import TableAction from "../TableAction";
import TextLink from "../TextLink";
import WorkOrderStatus from "./WorkOrderStatus";
import { compareBy, useSort } from "./useSort";

type SortKey = "name" | "last_workorder_updated_at" | "workorders_count" | "failed_workorders_count" | "enabled";

const sortValue = (key: SortKey) => (s: WorkflowStats) => {
  switch (key) {
    case "name":
      return s.workflow.name;
    case "last_workorder_updated_at":
      return s.lastWorkOrder?.updatedAt ?? null;
    case "workorders_count":
      return s.workordersCount;
    case "failed_workorders_count":
      return s.failedWorkordersCount;
    case "enabled":
      return s.workflow.enabled;
  }
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
  const { sortKey, direction, thProps } = useSort<SortKey>("name");
  const history = `/projects/${projectId}/history`;

  if (stats.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">
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
      </div>
    );
  }

  const rows = [...stats].sort(compareBy(sortValue(sortKey), direction));

  return (
    <div>
      <Table
        id="workflows-table"
        header={
          <Tr>
            <Th {...thProps("name")}>Name</Th>
            <Th {...thProps("last_workorder_updated_at")}>Latest Work Order</Th>
            <Th {...thProps("workorders_count")}>Work Orders</Th>
            <Th {...thProps("failed_workorders_count")}>Work Orders in a failed state</Th>
            <Th {...thProps("enabled")}>Enabled</Th>
            <Th>Actions</Th>
          </Tr>
        }
      >
        {rows.map((s) => {
          const wf = s.workflow;
          return (
            <Tr
              key={wf.id}
              id={`workflow-${wf.id}`}
              className="hover:bg-gray-100 transition-colors duration-200"
              onClick={() => navigate(`/projects/${projectId}/w/${wf.id}`)}
            >
              <Td className="wrap-break-word max-w-[15rem]">
                <div className="cursor-pointer">
                  <WorkflowName name={wf.name} enabled={wf.enabled} updatedAt={wf.updatedAt} />
                </div>
              </Td>
              <Td className="wrap-break-word max-w-[15rem]">
                <WorkOrderStatus state={s.lastWorkOrder?.state ?? null} updatedAt={s.lastWorkOrder?.updatedAt} />
              </Td>
              <Td className="wrap-break-word max-w-[10rem]">
                {s.workordersCount > 0 ? (
                  <div>
                    <div className="text-indigo-700 text-lg">
                      <Link className="hover:underline" to={history} onClick={(e) => e.stopPropagation()}>
                        {s.workordersCount}
                      </Link>
                    </div>
                    <div className="text-gray-500 text-xs">
                      ({s.stepCount} steps, <span>{s.stepSuccessRate.toFixed(1)}% success</span>)
                    </div>
                  </div>
                ) : (
                  <Zero />
                )}
              </Td>
              <Td className="wrap-break-word max-w-[15rem]">
                {s.failedWorkordersCount > 0 ? (
                  <div>
                    <div className="text-indigo-700 text-lg">
                      <Link className="hover:underline" to={history} onClick={(e) => e.stopPropagation()}>
                        {s.failedWorkordersCount}
                      </Link>
                    </div>
                    <div className="text-gray-500 text-xs">
                      Latest failure {s.lastFailedAt && <RelativeTime datetime={s.lastFailedAt} />}
                    </div>
                  </div>
                ) : (
                  <Zero spaced />
                )}
              </Td>
              <Td>
                <div onClick={(e) => e.stopPropagation()} title={toggleTooltip(wf.triggerType, wf.enabled)}>
                  <Toggle checked={wf.enabled} onChange={(v) => onToggle?.(wf.id, v)} />
                </div>
              </Td>
              <Td>
                <div className="flex items-center gap-4">
                  <TableAction to={`/projects/${projectId}/w/${wf.id}/health`}>Health</TableAction>
                  {canDelete && (
                    <TableAction
                      onClick={() => {
                        if (window.confirm("Are you sure you'd like to delete this workflow?")) onDelete?.(wf.id);
                      }}
                    >
                      Delete
                    </TableAction>
                  )}
                </div>
              </Td>
            </Tr>
          );
        })}
      </Table>
    </div>
  );
}

/** Lightning's `Helpers.workflow_state_tooltip`. */
function toggleTooltip(triggerType: string, enabled: boolean) {
  return enabled ? `This workflow is active (${triggerType} trigger enabled)` : "This workflow is inactive (manual runs only)";
}

function WorkflowName({ name, enabled, updatedAt }: { name: string; enabled: boolean; updatedAt: string }) {
  return (
    <div className="flex flex-1 items-center truncate">
      <div className="text-sm">
        <div className="flex items-center" title={enabled ? name : `${name} (disabled)`}>
          <span
            className={cn(
              "flex-shrink truncate font-medium workflow-name max-w-[200px] overflow-hidden text-ellipsis whitespace-nowrap",
              enabled ? "text-gray-900" : "text-gray-400"
            )}
          >
            {name}
          </span>
        </div>
        <p className="text-gray-500 text-xs mt-1">
          Updated <RelativeTime datetime={updatedAt} />
        </p>
      </div>
    </div>
  );
}

function Zero({ spaced = false }: { spaced?: boolean }) {
  return (
    <div>
      <div className="text-gray-400 text-lg">
        <span>0</span>
      </div>
      <div className={cn("text-xs", spaced && "mt-1")}>
        <span>N/A</span>
      </div>
    </div>
  );
}
