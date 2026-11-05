import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import HistoryFilterBar from "./HistoryFilterBar";
import { defaultHistoryFilters, type HistoryFilters } from "../../model/history";
import { allChannelRequests, allWorkOrders, historyWorkflows, projectChannelRequests, projectWorkOrders } from "../../fixtures/history";
import { projects } from "../../fixtures/projects";

const project = projects[0];

const meta: Meta<typeof HistoryFilterBar> = {
  title: "Domain/HistoryFilterBar",
  component: HistoryFilterBar,
  parameters: { layout: "padded" },
};

export default meta;
type Story = StoryObj<typeof HistoryFilterBar>;

function Controlled({ initial = {}, acrossProjects = false }: { initial?: Partial<HistoryFilters>; acrossProjects?: boolean }) {
  const [filters, setFilters] = useState<HistoryFilters>({ ...defaultHistoryFilters, ...initial });
  return (
    <HistoryFilterBar
      filters={filters}
      onChange={setFilters}
      workOrders={acrossProjects ? allWorkOrders() : projectWorkOrders(project)}
      channelRequests={acrossProjects ? allChannelRequests() : projectChannelRequests(project)}
      workflows={acrossProjects ? projects.flatMap(historyWorkflows) : historyWorkflows(project)}
      projects={acrossProjects ? projects.map((p) => ({ id: p.id, name: p.name })) : undefined}
    />
  );
}

/** A project's work orders, nothing filtered yet. */
export const Default: Story = { render: () => <Controlled /> };

/** Some filters set, each chip tinted with an × to clear it, and "Clear filters" for all of them. */
export const Filtered: Story = {
  render: () => (
    <Controlled
      initial={{ search: "502", statuses: ["failed", "cancelled"], activityAfter: "2026-10-13T10:00", workflowId: historyWorkflows(project)[0]?.id ?? null }}
    />
  ),
};

/** Opened from a link to one work order. */
export const OneWorkOrder: Story = {
  render: () => <Controlled initial={{ workOrderId: projectWorkOrders(project)[0]?.workOrder.id ?? null }} />,
};

/** Across every project, with a project filter. */
export const AcrossProjects: Story = { render: () => <Controlled acrossProjects /> };

/** The channel requests tab: channel and outcome. */
export const ChannelRequests: Story = { render: () => <Controlled initial={{ tab: "channels" }} /> };
