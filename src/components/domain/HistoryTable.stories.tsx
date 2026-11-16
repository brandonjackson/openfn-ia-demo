import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import HistoryTable from "./HistoryTable";
import { historyEntries, type HistoryColumnId } from "../../model/history";
import { historyWorkflows, projectChannelRequests, projectWorkOrders } from "../../fixtures/history";
import { projects } from "../../fixtures/projects";

const project = projects[0];
const entries = historyEntries(projectWorkOrders(project), projectChannelRequests(project));
const latestVersions = Object.fromEntries(historyWorkflows(project).map((w) => [w.id, w.latestVersion]));

function Table({ columns = [], open = [], selectable = true }: { columns?: HistoryColumnId[]; open?: string[]; selectable?: boolean }) {
  const [expanded, setExpanded] = useState(open);
  const [selected, setSelected] = useState<string[]>([]);
  return (
    <HistoryTable
      entries={entries}
      columns={columns}
      latestVersions={latestVersions}
      selectedKeys={selectable ? selected : undefined}
      onSelectedChange={selectable ? setSelected : undefined}
      expandedKeys={expanded}
      onToggle={(key) => setExpanded((e) => (e.includes(key) ? e.filter((k) => k !== key) : [...e, key]))}
      onRetry={() => {}}
      onCancel={() => {}}
      onInspectRun={() => {}}
      onRetryFromStep={() => {}}
      onOpenChannelRun={() => {}}
    />
  );
}

const meta: Meta<typeof HistoryTable> = {
  title: "Domain/HistoryTable",
  component: HistoryTable,
  parameters: { layout: "padded" },
};

export default meta;
type Story = StoryObj<typeof HistoryTable>;

/** A project's work orders and channel logs, just the name and status of each, with checkboxes on the work orders. */
export const Default: Story = { render: () => <Table /> };

/** With optional columns between the name and the status: each row fills in what applies to it. */
export const WithColumns: Story = { render: () => <Table columns={["received", "runs", "system", "endpoint", "duration"]} /> };

/** A work order opened to its runs, and a channel request opened to what it carried. */
export const Opened: Story = {
  render: () => <Table open={[entries.find((e) => e.kind === "workflow")!.key, entries.find((e) => e.kind === "channel")!.key]} />,
};

/** Read only: no checkboxes, as where you can't run workflows. */
export const ReadOnly: Story = { render: () => <Table selectable={false} /> };
