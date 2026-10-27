import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import WorkflowHealth from "./WorkflowHealth";
import type { ActivityPeriod } from "../../mock-data/runs";
import { workflowHealth, workOrders } from "../../mock-data/runs";
import { nationalIdWorkflow } from "../../mock-data/workflow";

const meta: Meta<typeof WorkflowHealth> = {
  title: "Workflow/WorkflowHealth",
  component: WorkflowHealth,
  parameters: { layout: "fullscreen" },
  decorators: [
    (Story) => (
      <div className="h-[900px] bg-gray-50">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof WorkflowHealth>;

function Interactive({ initial }: { initial: ActivityPeriod }) {
  const [period, setPeriod] = useState<ActivityPeriod>(initial);
  const [runId, setRunId] = useState<string>();
  return (
    <WorkflowHealth
      health={workflowHealth(nationalIdWorkflow, workOrders, period)}
      onPeriodChange={setPeriod}
      selectedRunId={runId}
      latestVersion="v2"
      onSelectRun={(run) => setRunId(run.runId)}
    />
  );
}

/** The last 30 days: runs on both versions, with failures at two steps. */
export const Default: Story = {
  render: () => <Interactive initial="30d" />,
};

/** The last 24 hours, in 2-hour bars. */
export const Last24Hours: Story = {
  render: () => <Interactive initial="24h" />,
};

/** No runs at all. */
export const NoRuns: Story = {
  args: {
    health: workflowHealth(nationalIdWorkflow, [], "7d"),
    onPeriodChange: () => {},
  },
};
