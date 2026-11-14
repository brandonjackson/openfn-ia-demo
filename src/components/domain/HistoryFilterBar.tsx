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
  type ChannelRequest,
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
  /** The tab showing and what it's filtered by. */
  filters: HistoryFilters;
  onChange: (filters: HistoryFilters) => void;
  /** Every work order, unfiltered, so the status filter can count what each status would show. */
  workOrders: HistoryWorkOrder[];
  /** Every channel request, unfiltered: their channels are the channel filter's choices. */
  channelRequests: ChannelRequest[];
  workflows: { id: string; name: string; projectId: string }[];
  /** Set across every project, to add the project filter. */
  projects?: { id: string; name: string }[];
  /** Adds the Outcome filter: the business outcome a work order's latest run reported. Off without tools. */
  showOutcomes?: boolean;
}

/** The value FilterOptions uses for "Any". */
const ANY = "";

/** "Failed", "Failed or Cancelled", "Pending, Failed or Cancelled". */
const orList = (words: string[]) => (words.length > 1 ? `${words.slice(0, -1).join(", ")} or ${words.at(-1)}` : words[0]);

const requestStatusLabels = { ok: "Succeeded", failed: "Failed" } as const;

/**
 * History's search and filters, as Lightning's History has them: a search
 * box over a row of chips, each saying what it's set to. Work orders filter
 * by workflow, status (any number, each with how many it would show), when
 * they were received and when they last ran, and where the search looks; a
 * link to one work order adds a chip for it. With `showOutcomes`, they also
 * filter by the outcome a Report outcome step recorded. Channel requests filter by
 * channel and outcome. Across every project, both filter by project too.
 */
export default function HistoryFilterBar({ filters, onChange, workOrders, channelRequests, workflows, projects, showOutcomes = false }: Props) {
  const set = (change: Partial<HistoryFilters>) => onChange({ ...filters, ...change });
  const { tab, projectId, workflowId, statuses } = filters;
  const projectName = (id: string) => projects?.find((p) => p.id === id)?.name;

  const beforeStatus = workOrders.filter((o) => matchesFilters(o, filters, "statuses"));
  const pickedStatuses = historyStatuses.filter((s) => statuses.includes(s.id)).map((s) => s.label);
  const beforeOutcome = workOrders.filter((o) => matchesFilters(o, filters, "outcomes"));
  const pickedOutcomes = outcomeStatuses.filter((o) => filters.outcomes.includes(o.id)).map((o) => o.label);
  const workflowsShown = workflows.filter((w) => !projectId || w.projectId === projectId);
  const workflowName = workflows.find((w) => w.id === workflowId)?.name;

  const channels = [
    ...new Map(channelRequests.filter((r) => !projectId || r.projectId === projectId).map((r) => [r.channelId, r.channelName])),
  ];
  const channelName = channels.find(([id]) => id === filters.channelId)?.[1];
  const beforeRequestStatus = channelRequests.filter((r) => matchesRequestFilters(r, { ...filters, requestStatus: null }));

  const projectChip = projects && (
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
  );

  const workOrderChips = (
    <>
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
      {projectChip}
      <FilterChip
        name="Workflow"
        label={`Workflow is ${workflowName ?? "any"}`}
        active={!!workflowId}
        onClear={() => set({ workflowId: null })}
        panelWidthClass="w-80"
      >
        {(close) => (
          <FilterOptions
            label="Workflow"
            options={[
              { id: ANY, label: "Any" },
              ...workflowsShown.map((w) => ({ id: w.id, label: w.name, description: projects ? projectName(w.projectId) : undefined })),
            ]}
            value={workflowId ?? ANY}
            onChange={(id) => {
              set({ workflowId: id || null });
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
            options={historyStatuses.map((s) => ({ ...s, count: beforeStatus.filter((o) => o.workOrder.status === s.id).length }))}
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
            afterLabel="Last run after"
            beforeLabel="Last run before"
            onChange={(after, before) => set({ activityAfter: after || null, activityBefore: before || null })}
          />
        )}
      </FilterChip>
      {filters.workOrderId && (
        <FilterChip name="Work order" label={`Work order ${filters.workOrderId}`} active onClear={() => set({ workOrderId: null })} />
      )}
    </>
  );

  const channelChips = (
    <>
      {projectChip}
      <FilterChip
        name="Channel"
        label={`Channel is ${channelName ?? "any"}`}
        active={!!filters.channelId}
        onClear={() => set({ channelId: null })}
        panelWidthClass="w-72"
      >
        {(close) => (
          <FilterOptions
            label="Channel"
            options={[{ id: ANY, label: "Any" }, ...channels.map(([id, name]) => ({ id, label: name }))]}
            value={filters.channelId ?? ANY}
            onChange={(id) => {
              set({ channelId: id || null });
              close();
            }}
          />
        )}
      </FilterChip>
      <FilterChip
        name="Status"
        label={`Status is ${filters.requestStatus ? requestStatusLabels[filters.requestStatus] : "any"}`}
        active={!!filters.requestStatus}
        onClear={() => set({ requestStatus: null })}
        panelWidthClass="w-52"
      >
        {(close) => (
          <FilterOptions
            label="Status"
            options={[
              { id: ANY, label: "Any", count: beforeRequestStatus.length },
              { id: "ok", label: requestStatusLabels.ok, count: beforeRequestStatus.filter((r) => r.status < 400).length },
              { id: "failed", label: requestStatusLabels.failed, count: beforeRequestStatus.filter((r) => r.status >= 400).length },
            ]}
            value={filters.requestStatus ?? ANY}
            onChange={(id) => {
              set({ requestStatus: (id || null) as HistoryFilters["requestStatus"] });
              close();
            }}
          />
        )}
      </FilterChip>
    </>
  );

  return (
    <Stack gap="sm">
      <SearchInput
        placeholder={tab === "work-orders" ? "Search work orders" : "Search requests"}
        aria-label="Search"
        value={filters.search}
        onChange={(e) => set({ search: e.target.value })}
      />
      <Inline wrap gap="sm">
        {tab === "work-orders" ? workOrderChips : channelChips}
        {activeFilterCount(filters) > 0 && (
          <Button size="sm" variant="ghost" onClick={() => onChange({ ...defaultHistoryFilters, tab, searchFields: filters.searchFields })}>
            Clear filters
          </Button>
        )}
      </Inline>
    </Stack>
  );
}
