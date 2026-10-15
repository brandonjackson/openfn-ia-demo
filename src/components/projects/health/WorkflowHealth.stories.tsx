import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import WorkflowHealth from "./WorkflowHealth";
import { DEFAULT_HEALTH_DAYS } from "../../../constants";
import { projects } from "../../../mock-data/projects";
import { healthFor } from "../../../mock-data/workflow-health";
import type { HealthRange } from "../../../types/workflow-health";
import { withRouter, withGrayPanel } from "../../../stories/decorators";

/** Holds the range like WorkflowHealthPage does, so the picker switches data. */
function WithRange({ workflowId, ...props }: { workflowId: string; workflowName: string; historyRetentionPeriod?: number }) {
  const [days, setDays] = useState<HealthRange["days"]>(DEFAULT_HEALTH_DAYS);
  return (
    <WorkflowHealth
      {...props}
      projectId={projects[0].id}
      days={days}
      onDaysChange={setDays}
      data={healthFor(workflowId, days)}
    />
  );
}

const meta: Meta<typeof WorkflowHealth> = {
  title: "Projects/Health/WorkflowHealth",
  component: WorkflowHealth,
  decorators: [withRouter, withGrayPanel],
};
export default meta;
type Story = StoryObj<typeof WorkflowHealth>;

export const WithFailures: Story = {
  render: () => <WithRange workflowId="wf-openhie" workflowName="OpenHIE Workflow" historyRetentionPeriod={90} />,
};
export const NoHistory: Story = {
  render: () => <WithRange workflowId="wf-facility-sync" workflowName="Facility registry sync" historyRetentionPeriod={90} />,
};
export const ShortRetention: Story = {
  render: () => <WithRange workflowId="wf-openhie" workflowName="OpenHIE Workflow" historyRetentionPeriod={7} />,
};
