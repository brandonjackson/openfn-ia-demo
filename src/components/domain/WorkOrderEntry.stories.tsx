import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import WorkOrderEntry from "./WorkOrderEntry";
import Card from "../primitives/Card";
import Stack from "../primitives/Stack";
import { projectWorkOrders } from "../../fixtures/history";
import { projects } from "../../fixtures/projects";
import type { HistoryWorkOrder } from "../../model/history";
import { hardshipGrantDataclips, hardshipGrantWorkOrders } from "../../fixtures/runs";

/** A hardship grant work order, as History lists it. */
const grant = (index: number): HistoryWorkOrder => {
  const workOrder = hardshipGrantWorkOrders[index]!;
  return {
    workOrder,
    workflowId: "hardship-grant-workflow",
    workflowName: "hardship-grant-workflow",
    projectId: "project-a",
    projectName: "Project A",
    input: hardshipGrantDataclips.find((d) => d.id === workOrder.runs[0].inputId)!,
    receivedAt: workOrder.runs[0].started,
  };
};

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
  // Answering a waiting run takes a moment, as it would on the server.
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
      onAnswer={() => new Promise((resolve) => setTimeout(resolve, 600))}
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

/** Waiting on a district officer to approve the grant: answered from here. */
export const WaitingOnSomeone: Story = { render: () => <Card flush><Entry order={grant(0)} startOpen /></Card> };

/** Its outcome beside its status: the run succeeded, the application was declined. */
export const WithOutcome: Story = {
  render: () => (
    <Card flush>
      <Stack divided>
        {hardshipGrantWorkOrders.map((_, i) => (
          <Entry key={i} order={grant(i)} />
        ))}
      </Stack>
    </Card>
  ),
};
