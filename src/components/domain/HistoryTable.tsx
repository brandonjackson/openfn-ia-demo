import type { ReactNode } from "react";
import { ArrowLeftRight, Ban, RotateCcw, Search, Workflow } from "lucide-react";
import { receivedTime, requestStatus, shortTime, type ChannelRequest, type HistoryColumnId, type HistoryEntry, type HistoryWorkOrder } from "../../model/history";
import type { RunDetails, RunStep } from "../../model/workflow";
import type { ApprovalDecision } from "../../model/step-tools";
import DataTable, { type DataTableColumn } from "../primitives/DataTable";
import Checkbox from "../primitives/Checkbox";
import IconTile from "../primitives/IconTile";
import Stack from "../primitives/Stack";
import Inline from "../primitives/Inline";
import Text from "../primitives/Text";
import Badge from "../primitives/Badge";
import Button from "../primitives/Button";
import StatusPill from "./StatusPill";
import OutcomeBadge from "./OutcomeBadge";
import RunEntry from "./RunEntry";
import { channelTypeConfig } from "./channel-types";

interface Props {
  /** Work orders and channel requests, in the order to show them. */
  entries: HistoryEntry[];
  /** The optional columns showing, between the name and the status (which always show). */
  columns?: HistoryColumnId[];
  /** Each workflow's latest version, to tag runs on an older one. */
  latestVersions?: Record<string, string>;
  /** The work orders picked for a bulk action, by id. Left out, rows have no checkboxes. */
  selectedIds?: string[];
  onSelectedChange?: (ids: string[]) => void;
  /** The rows open to show their runs or request, by entry key. */
  expandedKeys: string[];
  onToggle: (key: string) => void;
  /** Runs a work order again from the start. Left out where you can't run workflows. */
  onRetry?: (workOrderId: string) => void;
  /** Cancels a work order while it's still waiting to run. */
  onCancel?: (workOrderId: string) => void;
  /** Opens one of a work order's runs in the editor. */
  onInspectRun?: (order: HistoryWorkOrder, run: RunDetails) => void;
  /** Runs a work order again from one of a run's steps. */
  onRetryFromStep?: (workOrderId: string, step: RunStep) => void;
  /** Answers a run waiting on a Human in the loop step; resolves once it has carried on. */
  onAnswer?: (run: RunDetails, decision: ApprovalDecision, comment: string) => Promise<void>;
  /** Opens the run a channel request started or came from. */
  onOpenChannelRun?: (request: ChannelRequest) => void;
  emptyMessage?: string;
}

const finished = (order: HistoryWorkOrder) => !["pending", "running", "waiting"].includes(order.workOrder.status);

/** Just the path of an address, which is what tells one request from another. */
function pathOf(endpoint: string): string {
  try {
    return new URL(endpoint).pathname;
  } catch {
    return endpoint;
  }
}

/** What each optional column says for a row; nothing where it doesn't apply to that kind of record. */
const extraColumns: Record<HistoryColumnId, { header: string; render: (e: HistoryEntry) => ReactNode }> = {
  project: {
    header: "Project",
    render: (e) => <Text nowrap>{e.kind === "workflow" ? e.order.projectName : e.request.projectName}</Text>,
  },
  received: {
    header: "Received",
    render: (e) => (
      <Text tone="muted" size="xs" nowrap>
        {shortTime(receivedTime(e))}
      </Text>
    ),
  },
  outcome: {
    header: "Outcome",
    render: (e) => (e.kind === "workflow" && e.order.workOrder.outcome ? <OutcomeBadge status={e.order.workOrder.outcome.status} /> : null),
  },
  runs: {
    header: "Runs",
    render: (e) => (e.kind === "workflow" ? <Text tone="muted">{e.order.workOrder.runs.length}</Text> : null),
  },
  input: {
    header: "Input",
    render: (e) =>
      e.kind === "workflow" ? (
        <Text tone="muted" size="xs" mono nowrap>
          {e.order.input.name ?? e.order.input.id}
        </Text>
      ) : null,
  },
  system: {
    header: "System",
    render: (e) => (e.kind === "channel" ? <Text nowrap>{e.request.system}</Text> : null),
  },
  endpoint: {
    header: "Endpoint",
    render: (e) =>
      e.kind === "channel" ? (
        <Text tone="muted" size="xs" mono nowrap>
          {`${e.request.method} ${pathOf(e.request.endpoint)}`}
        </Text>
      ) : null,
  },
  duration: {
    header: "Duration",
    render: (e) =>
      e.kind === "channel" ? (
        <Text tone="muted" size="xs" nowrap>
          {`${e.request.durationMs} ms`}
        </Text>
      ) : null,
  },
};

/**
 * History's list: work orders and channel requests side by side, each one
 * row as the database holds it. A row shows what it came through (a
 * workflow or a channel, told apart by its icon) with its id, and, on the
 * right, its status with when it last moved; a request's HTTP code sits
 * left of the pill so the pills line up. On a phone only the name and the
 * pill show. Any optional `columns` go between the two. Opening a work
 * order shows its runs, with retry and cancel; opening a request shows what
 * it carried, and the run it started or came from.
 */
export default function HistoryTable({
  entries,
  columns = [],
  latestVersions = {},
  selectedIds,
  onSelectedChange,
  expandedKeys,
  onToggle,
  onRetry,
  onCancel,
  onInspectRun,
  onRetryFromStep,
  onAnswer,
  onOpenChannelRun,
  emptyMessage = "Nothing here yet.",
}: Props) {
  const orderIds = entries.flatMap((e) => (e.kind === "workflow" ? [e.order.workOrder.id] : []));
  const picked = selectedIds ?? [];
  const allPicked = orderIds.length > 0 && orderIds.every((id) => picked.includes(id));

  const select: DataTableColumn<HistoryEntry>[] = onSelectedChange
    ? [
        {
          key: "select",
          shrink: true,
          // Bulk actions are for a wider screen; on a phone a row is its name and status.
          hideOnMobile: true,
          header: (
            <Checkbox
              label="Select every work order shown"
              hideLabel
              checked={allPicked}
              indeterminate={picked.length > 0 && !allPicked}
              onChange={(on) => onSelectedChange(on ? orderIds : [])}
            />
          ),
          render: (e) =>
            e.kind === "workflow" ? (
              <Checkbox
                label={`Select work order ${e.order.workOrder.id}`}
                hideLabel
                checked={picked.includes(e.order.workOrder.id)}
                onChange={(on) =>
                  onSelectedChange(on ? [...picked, e.order.workOrder.id] : picked.filter((id) => id !== e.order.workOrder.id))
                }
              />
            ) : null,
        },
      ]
    : [];

  const name: DataTableColumn<HistoryEntry> = {
    key: "name",
    header: "Name",
    fill: true,
    render: (e) => (
      <Inline gap="sm">
        <IconTile icon={e.kind === "workflow" ? Workflow : ArrowLeftRight} tone="white" size="sm" />
        <Stack gap="none">
          <Text tone="strong" truncate>
            {e.kind === "workflow" ? e.order.workflowName : e.request.channelName}
          </Text>
          <Text tone="subtle" size="xs" mono truncate>
            {e.kind === "workflow" ? e.order.workOrder.id : e.request.id}
          </Text>
        </Stack>
      </Inline>
    ),
  };

  const status: DataTableColumn<HistoryEntry> = {
    key: "status",
    header: "Status",
    align: "right",
    render: (e) => {
      const runs = e.kind === "workflow" ? e.order.workOrder.runs.length : 0;
      return (
        <Stack gap="none" align="end">
          <Inline gap="xs">
            {e.kind === "channel" && (
              <Text tone="muted" size="xs" mono hideOnMobile>
                {e.request.status}
              </Text>
            )}
            <StatusPill status={e.kind === "workflow" ? e.order.workOrder.status : requestStatus(e.request)} />
          </Inline>
          <Text tone="subtle" size="xs" nowrap hideOnMobile>
            {e.kind === "workflow"
              ? runs > 1
                ? `${e.order.workOrder.lastActivity} · ${runs} runs`
                : e.order.workOrder.lastActivity
              : `${e.request.at} · ${e.request.durationMs} ms`}
          </Text>
        </Stack>
      );
    },
  };

  const extras: DataTableColumn<HistoryEntry>[] = columns.map((id) => ({ key: id, hideOnMobile: true, ...extraColumns[id] }));

  const workOrderDetail = (order: HistoryWorkOrder) => {
    const { workOrder, input } = order;
    const id = workOrder.id;
    return (
      <Stack gap="sm">
        <Inline justify="between" wrap>
          <Text tone="muted" size="xs">
            {`Received ${order.receivedAt} · input ${input.name ?? input.id}`}
          </Text>
          <Inline gap="xs">
            {workOrder.status === "pending" && onCancel && (
              <Button size="xs" variant="secondary" icon={Ban} aria-label={`Cancel work order ${id}`} onClick={() => onCancel(id)}>
                Cancel
              </Button>
            )}
            {finished(order) && onRetry && (
              <Button size="xs" variant="secondary" icon={RotateCcw} aria-label={`Retry work order ${id}`} onClick={() => onRetry(id)}>
                Retry
              </Button>
            )}
          </Inline>
        </Inline>
        {workOrder.runs.map((run) => (
          <RunEntry
            key={run.runId}
            run={run}
            latestVersion={latestVersions[order.workflowId]}
            onInspect={onInspectRun && ((r) => onInspectRun(order, r))}
            onRetryFromStep={onRetryFromStep && ((_r, step) => onRetryFromStep(id, step))}
            onCancel={onCancel && (() => onCancel(id))}
            onAnswer={onAnswer}
          />
        ))}
      </Stack>
    );
  };

  const requestDetail = (request: ChannelRequest) => (
    <Stack gap="sm">
      <Text>{request.summary}</Text>
      <Inline gap="sm" wrap>
        <Badge label={request.method} tone="gray" />
        <Text tone="muted" size="xs" mono>
          {request.endpoint}
        </Text>
      </Inline>
      <Text tone="muted" size="xs">
        {`${channelTypeConfig[request.channelType].label} channel to ${request.system} · HTTP ${request.status} in ${request.durationMs} ms · ${request.at}`}
      </Text>
      {request.runId && onOpenChannelRun && (
        <Inline>
          <Button size="xs" variant="secondary" icon={Search} onClick={() => onOpenChannelRun(request)}>
            Open run
          </Button>
        </Inline>
      )}
    </Stack>
  );

  return (
    <DataTable
      columns={[...select, name, ...extras, status]}
      rows={entries}
      getRowKey={(e) => e.key}
      emptyMessage={emptyMessage}
      selectedKeys={entries.filter((e) => e.kind === "workflow" && picked.includes(e.order.workOrder.id)).map((e) => e.key)}
      onRowClick={(e) => onToggle(e.key)}
      rowLabel={(e) =>
        e.kind === "workflow" ? `Work order ${e.order.workOrder.id}, ${e.order.workOrder.status}` : `Channel request ${e.request.id}, ${requestStatus(e.request)}`
      }
      renderDetail={(e) =>
        expandedKeys.includes(e.key) ? (e.kind === "workflow" ? workOrderDetail(e.order) : requestDetail(e.request)) : null
      }
    />
  );
}
