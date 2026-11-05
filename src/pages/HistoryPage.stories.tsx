import type { Meta, StoryObj } from "@storybook/react";
import HistoryPage from "./HistoryPage";
import { withRouter } from "../stories/decorators";
import { allChannelRequests, allWorkOrders, historyWorkflows, projectChannelRequests, projectWorkOrders } from "../fixtures/history";
import { projects } from "../fixtures/projects";
import type { IANode } from "../model/ia-tree";
import type { HistoryPageData } from "../model/page-data";

const project = projects[0];

const node: IANode = {
  id: "history",
  label: "History",
  description: "Work orders and channel requests for this project.",
};

const projectData: HistoryPageData = {
  pageType: "table",
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

const meta: Meta<typeof HistoryPage> = {
  title: "Pages/HistoryPage",
  component: HistoryPage,
  decorators: [withRouter],
  parameters: { layout: "padded" },
  args: {
    node,
    ancestors: [
      { node: { id: "projects", label: "Projects" }, path: "/projects" },
      { node: { id: "project", label: project.name }, path: `/projects/${project.id}` },
    ],
    currentPath: `/projects/${project.id}/history`,
    data: projectData,
    ...actions,
  },
};

export default meta;
type Story = StoryObj<typeof HistoryPage>;

/** A project's work orders, newest first, with one waiting to run. */
export const Default: Story = {};

/** Opened from a link to the project's failed work orders. */
export const FailedOnly: Story = { args: { initialFilters: { status: "failed" } } };

/** The requests the project's channels carried. */
export const ChannelRequests: Story = { args: { initialFilters: { tab: "channels" } } };

/** Across every project, with a project filter and the project on each row. */
export const AcrossProjects: Story = {
  args: {
    node: { ...node, description: "View historical work orders and channel requests across all projects." },
    ancestors: [],
    currentPath: "/history",
    data: {
      pageType: "table",
      workOrders: allWorkOrders(),
      channelRequests: allChannelRequests(),
      workflows: projects.flatMap(historyWorkflows),
      projects: projects.map((p) => ({ id: p.id, name: p.name })),
    },
  },
};

/** Without permission to run workflows: no retry or cancel. */
export const ReadOnly: Story = {
  args: { onRetry: undefined, onRetryFromStep: undefined, onCancel: undefined },
};

export const Empty: Story = {
  args: { data: { ...projectData, workOrders: [], channelRequests: [] } },
};
