import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import HistoryPage, { type HistoryPageProps } from "./HistoryPage";
import { withRouter } from "../../stories/decorators";
import { allChannelRequests, allWorkOrders, historyWorkflows, projectChannelRequests, projectWorkOrders } from "../../fixtures/history";
import { projects } from "../../fixtures/projects";
import type { IANode } from "../../model/ia-tree";
import type { HistoryPageData } from "./HistoryPage";
import { defaultHistoryFilters, type HistoryFilters } from "../../model/history";

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

/** Keeps the filters as the wrapper's URL would, starting from the story's. */
function WithFilters(props: HistoryPageProps) {
  const [filters, setFilters] = useState<HistoryFilters>(props.filters);
  return <HistoryPage {...props} filters={filters} onFiltersChange={setFilters} />;
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
    ...actions,
  },
};

export default meta;
type Story = StoryObj<typeof HistoryPage>;

/** A project's work orders, newest first, with one waiting to run. */
export const Default: Story = {};

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

/** The requests the project's channels carried. */
export const ChannelRequests: Story = { args: { filters: { ...defaultHistoryFilters, tab: "channels" } } };

/** Across every project, with a project filter and the project on each row. */
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
    // An export belongs to one project, so there's none across projects.
    onExport: undefined,
  },
};

/** A retry the server refused says why above the filters, and keeps the picks. */
export const RetryRefused: Story = {
  args: { onRetry: () => Promise.reject(new Error("You can't run workflows in this project.")) },
  play: async ({ canvasElement }) => {
    const finished = projectData.workOrders.find((o) => !["pending", "running"].includes(o.workOrder.status));
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
