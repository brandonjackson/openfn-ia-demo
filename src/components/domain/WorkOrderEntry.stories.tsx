import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import WorkOrderEntry from "./WorkOrderEntry";
import Card from "../primitives/Card";
import Stack from "../primitives/Stack";
import { projectWorkOrders } from "../../fixtures/history";
import { projects } from "../../fixtures/projects";
import type { HistoryWorkOrder } from "../../model/history";

const orders = projectWorkOrders(projects[0]);
const retried = orders.find((o) => o.workOrder.runs.length > 1)!;
const failed = orders.find((o) => o.workOrder.status === "failed")!;
const enqueued = orders.find((o) => o.workOrder.status === "pending")!;

const meta: Meta<typeof WorkOrderEntry> = {
  title: "Domain/WorkOrderEntry",
  component: WorkOrderEntry,
  args: { latestVersion: "v2", onRetry: () => {}, onCancel: () => {}, onInspectRun: () => {}, onRetryFromStep: () => {} },
};

export default meta;
type Story = StoryObj<typeof WorkOrderEntry>;

function Entry({ order, startOpen = false, showProject = false }: { order: HistoryWorkOrder; startOpen?: boolean; showProject?: boolean }) {
  const [expanded, setExpanded] = useState(startOpen);
  const [selected, setSelected] = useState(false);
  return (
    <WorkOrderEntry
      order={order}
      showProject={showProject}
      latestVersion="v2"
      selected={selected}
      onSelectChange={setSelected}
      expanded={expanded}
      onToggle={() => setExpanded((e) => !e)}
      onRetry={() => {}}
      onCancel={() => {}}
      onInspectRun={() => {}}
      onRetryFromStep={() => {}}
    />
  );
}

/** A failed first run, then a retry that went through. */
export const Retried: Story = { render: () => <Card flush><Entry order={retried} startOpen /></Card> };

export const Failed: Story = { render: () => <Card flush><Entry order={failed} startOpen /></Card> };

/** Waiting to run, so it can be cancelled instead of retried. */
export const Enqueued: Story = { render: () => <Card flush><Entry order={enqueued} /></Card> };

/** In History across every project, the row says which project it's from. */
export const InAList: Story = {
  render: () => (
    <Card flush>
      <Stack divided>
        {orders.slice(0, 5).map((o) => (
          <Entry key={o.workOrder.id} order={o} showProject />
        ))}
      </Stack>
    </Card>
  ),
};
