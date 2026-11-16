import type { ReactNode } from "react";
import type { RunStatus } from "../../model/workflow";
import {
  activeFilterCount,
  defaultHistoryFilters,
  describeDateRange,
  describeSearchFields,
  historyDatePresets,
  historySearchFields,
  historyStatuses,
  matchesFilters,
  matchesRequestFilters,
  requestStatus,
  type ChannelRequest,
  type HistoryKind,
  type HistoryFilters,
  type HistorySearchField,
  type HistoryWorkOrder,
} from "../../model/history";
import Stack from "../primitives/Stack";
import Inline from "../primitives/Inline";
import Button from "../primitives/Button";
import SearchInput from "../primitives/SearchInput";
import FilterChip, { FilterChecklist, FilterDateRange, FilterOptions } from "../primitives/FilterChip";
import { outcomeStatuses, type OutcomeStatus } from "../../model/step-tools";

interface Props {
  /** What History is filtered by. */
  filters: HistoryFilters;
  onChange: (filters: HistoryFilters) => void;
  /** Every work order, unfiltered, so the status filter can count what each status would show. */
  workOrders: HistoryWorkOrder[];
  /** Every channel request, unfiltered: their channels are choices beside the workflows, and they're counted by status too. */
  channelRequests: ChannelRequest[];
  workflows: { id: string; name: string; projectId: string }[];
  /** Set across every project, to add the project filter. */
  projects?: { id: string; name: string }[];
  /** Adds the Outcome filter: the business outcome a work order's latest run reported. Off without tools. */
  showOutcomes?: boolean;
  /** Beside the search box, e.g. the list's Columns button. */
  trailing?: ReactNode;
}

/** The value FilterOptions uses for "Any". */
const ANY = "";

/** "Failed", "Failed or Cancelled", "Pending, Failed or Cancelled". */
const orList = (words: string[]) => (words.length > 1 ? `${words.slice(0, -1).join(", ")} or ${words.at(-1)}` : words[0]);

const kindLabels: Record<HistoryKind, string> = { workflow: "Workflow runs", channel: "Channel logs" };

/**
 * History's search and filters, as Lightning's History has them: a search
 * box over a row of chips, each saying what it's set to. History lists work
 * orders and channel requests together, so the chips filter both: by type,
 * by the workflow or channel they came through (Source), by status (any
 * number, each with how many it would show; a request succeeded under 400),
 * when they were received and last moved, and where the search looks. A
 * filter only work orders have (a workflow, an outcome, a work order from a
 * link) leaves the requests out. With `showOutcomes`, work orders also filter
 * by the outcome a Report outcome step recorded. Across every project, both
 * filter by project too.
 */
export default function HistoryFilterBar({ filters, onChange, workOrders, channelRequests, workflows, projects, showOutcomes = false, trailing }: Props) {
  const set = (change: Partial<HistoryFilters>) => onChange({ ...filters, ...change });
  const { projectId, workflowId, channelId, statuses } = filters;
  const projectName = (id: string) => projects?.find((p) => p.id === id)?.name;

  const ordersBeforeStatus = workOrders.filter((o) => matchesFilters(o, filters, "statuses"));
  const requestsBeforeStatus = channelRequests.filter((r) => matchesRequestFilters(r, filters, "statuses"));
  const statusCount = (id: RunStatus) =>
    ordersBeforeStatus.filter((o) => o.workOrder.status === id).length + requestsBeforeStatus.filter((r) => requestStatus(r) === id).length;
  const pickedStatuses = historyStatuses.filter((s) => statuses.includes(s.id)).map((s) => s.label);
  const beforeOutcome = workOrders.filter((o) => matchesFilters(o, filters, "outcomes"));
  const pickedOutcomes = outcomeStatuses.filter((o) => filters.outcomes.includes(o.id)).map((o) => o.label);

  const workflowsShown = workflows.filter((w) => !projectId || w.projectId === projectId);
  const channels = [
    ...new Map(channelRequests.filter((r) => !projectId || r.projectId === projectId).map((r) => [r.channelId, { name: r.channelName, projectId: r.projectId }])),
  ];
  const sourceName = workflows.find((w) => w.id === workflowId)?.name ?? channels.find(([id]) => id === channelId)?.[1].name;
  const sources = [
    ...workflowsShown.map((w) => ({ id: `workflow:${w.id}`, label: w.name, description: projects ? `Workflow · ${projectName(w.projectId)}` : "Workflow" })),
    ...channels.map(([id, c]) => ({ id: `channel:${id}`, label: c.name, description: projects ? `Channel · ${projectName(c.projectId)}` : "Channel" })),
  ];

  return (
    <Stack gap="sm">
      <Inline gap="sm">
        <Stack grow>
          <SearchInput placeholder="Search history" aria-label="Search" value={filters.search} onChange={(e) => set({ search: e.target.value })} />
        </Stack>
        {trailing}
      </Inline>
      <Inline wrap gap="sm">
        <FilterChip name="Search in" label={`Search in ${describeSearchFields(filters.searchFields)}`} panelWidthClass="w-72">
          {() => (
            <FilterChecklist
              keepOne
              options={historySearchFields}
              checked={filters.searchFields}
              onChange={(ids) => set({ searchFields: ids as HistorySearchField[] })}
            />
          )}
        </FilterChip>
        {projects && (
          <FilterChip
            name="Project"
            label={`Project is ${projectId ? projectName(projectId) : "any"}`}
            active={!!projectId}
            onClear={() => set({ projectId: null, workflowId: null, channelId: null })}
            panelWidthClass="w-72"
          >
            {(close) => (
              <FilterOptions
                label="Project"
                options={[{ id: ANY, label: "Any" }, ...projects.map((p) => ({ id: p.id, label: p.name }))]}
                value={projectId ?? ANY}
                onChange={(id) => {
                  // A workflow or channel of another project would leave the list empty.
                  set({ projectId: id || null, workflowId: null, channelId: null });
                  close();
                }}
              />
            )}
          </FilterChip>
        )}
        <FilterChip
          name="Type"
          label={`Type is ${filters.kind ? kindLabels[filters.kind] : "any"}`}
          active={!!filters.kind}
          onClear={() => set({ kind: null })}
          panelWidthClass="w-52"
        >
          {(close) => (
            <FilterOptions
              label="Type"
              options={[
                { id: ANY, label: "Any" },
                { id: "workflow", label: kindLabels.workflow },
                { id: "channel", label: kindLabels.channel },
              ]}
              value={filters.kind ?? ANY}
              onChange={(id) => {
                // A workflow or channel of the other type would leave the list empty.
                const kind = (id || null) as HistoryKind | null;
                set({ kind, workflowId: kind === "channel" ? null : workflowId, channelId: kind === "workflow" ? null : channelId });
                close();
              }}
            />
          )}
        </FilterChip>
        <FilterChip
          name="Source"
          label={`Source is ${sourceName ?? "any"}`}
          active={!!(workflowId || channelId)}
          onClear={() => set({ workflowId: null, channelId: null })}
          panelWidthClass="w-80"
        >
          {(close) => (
            <FilterOptions
              label="Source"
              options={[{ id: ANY, label: "Any" }, ...sources]}
              value={workflowId ? `workflow:${workflowId}` : channelId ? `channel:${channelId}` : ANY}
              onChange={(id) => {
                const [kind, sourceId] = id.split(":");
                set({ workflowId: kind === "workflow" ? sourceId! : null, channelId: kind === "channel" ? sourceId! : null });
                close();
              }}
            />
          )}
        </FilterChip>
        <FilterChip
          name="Status"
          label={`Status is ${pickedStatuses.length ? orList(pickedStatuses) : "any"}`}
          active={statuses.length > 0}
          onClear={() => set({ statuses: [] })}
          panelWidthClass="w-52"
        >
          {() => (
            <FilterChecklist
              options={historyStatuses.map((s) => ({ ...s, count: statusCount(s.id) }))}
              checked={statuses}
              onChange={(ids) => set({ statuses: ids as RunStatus[] })}
            />
          )}
        </FilterChip>
        {showOutcomes && (
          <FilterChip
            name="Outcome"
            label={`Outcome is ${pickedOutcomes.length ? orList(pickedOutcomes) : "any"}`}
            active={filters.outcomes.length > 0}
            onClear={() => set({ outcomes: [] })}
            panelWidthClass="w-60"
          >
            {() => (
              <FilterChecklist
                options={outcomeStatuses.map((o) => ({ id: o.id, label: o.label, count: beforeOutcome.filter((w) => w.workOrder.outcome?.status === o.id).length }))}
                checked={filters.outcomes}
                onChange={(ids) => set({ outcomes: ids as OutcomeStatus[] })}
              />
            )}
          </FilterChip>
        )}
        <FilterChip
          name="Received"
          label={`Received ${describeDateRange(filters.receivedAfter, filters.receivedBefore)}`}
          active={!!(filters.receivedAfter || filters.receivedBefore)}
          onClear={() => set({ receivedAfter: null, receivedBefore: null })}
        >
          {() => (
            <FilterDateRange
              presets={historyDatePresets()}
              after={filters.receivedAfter ?? ""}
              before={filters.receivedBefore ?? ""}
              afterLabel="Received after"
              beforeLabel="Received before"
              onChange={(after, before) => set({ receivedAfter: after || null, receivedBefore: before || null })}
            />
          )}
        </FilterChip>
        <FilterChip
          name="Last activity"
          label={`Last activity ${describeDateRange(filters.activityAfter, filters.activityBefore)}`}
          active={!!(filters.activityAfter || filters.activityBefore)}
          onClear={() => set({ activityAfter: null, activityBefore: null })}
        >
          {() => (
            <FilterDateRange
              presets={historyDatePresets()}
              after={filters.activityAfter ?? ""}
              before={filters.activityBefore ?? ""}
              afterLabel="Last active after"
              beforeLabel="Last active before"
              onChange={(after, before) => set({ activityAfter: after || null, activityBefore: before || null })}
            />
          )}
        </FilterChip>
        {filters.workOrderId && (
          <FilterChip name="Work order" label={`Work order ${filters.workOrderId}`} active onClear={() => set({ workOrderId: null })} />
        )}
        {activeFilterCount(filters) > 0 && (
          <Button size="sm" variant="ghost" onClick={() => onChange({ ...defaultHistoryFilters, searchFields: filters.searchFields })}>
            Clear filters
          </Button>
        )}
      </Inline>
    </Stack>
  );
}
