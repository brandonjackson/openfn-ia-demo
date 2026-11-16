import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import HistoryPage, { type HistoryPageProps } from "./HistoryPage";
import { withRouter } from "../../stories/decorators";
import { allChannelRequests, allWorkOrders, historyWorkflows, projectChannelRequests, projectWorkOrders } from "../../fixtures/history";
import { projects } from "../../fixtures/projects";
import type { IANode } from "../../model/ia-tree";
import type { HistoryPageData } from "./HistoryPage";
import { defaultHistoryFilters, type HistoryColumnId, type HistoryFilters } from "../../model/history";

const project = projects[0];

const node: IANode = {
  id: "history",
  label: "History",
  description: "Work orders and channel requests for this project.",
};

const projectData: HistoryPageData = {
  workOrders: projectWorkOrders(project),
  channelRequests: projectChannelRequests(project),
  workflows: historyWorkflows(project),
};

const actions = {
  onRetry: async () => {},
  onRetryFromStep: async () => {},
  onCancel: async () => {},
  onInspectRun: () => {},
  onOpenChannelRun: () => {},
  onExport: async () => {},
};

/** Keeps the filters and columns as the wrapper would, starting from the story's. */
function WithFilters(props: HistoryPageProps) {
  const [filters, setFilters] = useState<HistoryFilters>(props.filters);
  const [columns, setColumns] = useState<HistoryColumnId[]>(props.columns);
  return <HistoryPage {...props} filters={filters} onFiltersChange={setFilters} columns={columns} onColumnsChange={setColumns} />;
}

const meta: Meta<typeof HistoryPage> = {
  title: "Pages/HistoryPage",
  component: HistoryPage,
  decorators: [withRouter],
  render: (args) => <WithFilters {...args} />,
  parameters: { layout: "padded" },
  args: {
    node,
    ancestors: [
      { node: { id: "projects", label: "Projects" }, path: "/projects" },
      { node: { id: "project", label: project.name }, path: `/projects/${project.id}` },
    ],
    currentPath: `/projects/${project.id}/history`,
    data: projectData,
    filters: defaultHistoryFilters,
    onFiltersChange: () => {},
    columns: [],
    onColumnsChange: () => {},
    ...actions,
  },
};

export default meta;
type Story = StoryObj<typeof HistoryPage>;

/** A project's work orders and channel logs together, the most recently active first: just each one's name and status. */
export const Default: Story = {};

/** With columns added from Columns: each row fills in the ones that apply to it. */
export const WithColumns: Story = { args: { columns: ["received", "runs", "system", "endpoint", "duration"] } };

/** Opened from a link to the project's failed work orders. */
export const FailedOnly: Story = { args: { filters: { ...defaultHistoryFilters, statuses: ["failed"] } } };

/** Searched and filtered by when the work orders last ran. */
export const Filtered: Story = {
  args: { filters: { ...defaultHistoryFilters, search: "502", activityAfter: "2026-10-13T10:00" } },
};

/** Opened from a link to one work order, which shows open. */
export const OneWorkOrder: Story = {
  args: { filters: { ...defaultHistoryFilters, workOrderId: projectData.workOrders[0]?.workOrder.id ?? null } },
};

/** Only the requests the project's channels carried. */
export const ChannelLogs: Story = { args: { filters: { ...defaultHistoryFilters, kind: "channel" } } };

/** Across every project, with a project filter and a Project column. */
export const AcrossProjects: Story = {
  args: {
    node: { ...node, description: "View historical work orders and channel requests across all projects." },
    ancestors: [],
    currentPath: "/history",
    data: {
      workOrders: allWorkOrders(),
      channelRequests: allChannelRequests(),
      workflows: projects.flatMap(historyWorkflows),
      projects: projects.map((p) => ({ id: p.id, name: p.name })),
    },
    columns: ["project"],
    // An export belongs to one project, so there's none across projects.
    onExport: undefined,
  },
};

const finished = projectData.workOrders.find((o) => !["pending", "running", "waiting"].includes(o.workOrder.status));

/** A retry the server refused (the wrapper's toast says why), from a work order opened to its runs. */
export const RetryRefused: Story = {
  args: {
    onRetry: () => Promise.reject(new Error("You can't run workflows in this project.")),
    filters: { ...defaultHistoryFilters, workOrderId: finished?.workOrder.id ?? null },
  },
  play: async ({ canvasElement }) => {
    canvasElement.querySelector<HTMLButtonElement>(`button[aria-label="Retry work order ${finished?.workOrder.id}"]`)?.click();
  },
};

/** Without permission to run workflows: no retry or cancel. */
export const ReadOnly: Story = {
  args: { onRetry: undefined, onRetryFromStep: undefined, onCancel: undefined },
};

export const Empty: Story = {
  args: { data: { ...projectData, workOrders: [], channelRequests: [] } },
};

/** With tools on: work orders show their outcome in its column and filter by it, and a run waiting on someone is approved or rejected from its work order. */
export const WithTools: Story = {
  args: {
    showOutcomes: true,
    columns: ["outcome"],
    onAnswerApproval: () => new Promise((resolve) => setTimeout(resolve, 600)),
    filters: { ...defaultHistoryFilters, statuses: ["waiting"] },
  },
};
