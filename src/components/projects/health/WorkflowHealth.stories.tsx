import type { Meta, StoryObj } from "@storybook/react";
import WorkflowHealth from "./WorkflowHealth";
import { projects } from "../../../mock-data/projects";
import { withRouter } from "../../../stories/decorators";

const meta: Meta<typeof WorkflowHealth> = {
  title: "Projects/Health/WorkflowHealth",
  component: WorkflowHealth,
  decorators: [withRouter, (Story) => <div className="bg-gray-100 p-8"><Story /></div>],
  args: { workflowId: "wf-openhie", projectId: projects[0].id, workflowName: "OpenHIE Workflow", historyRetentionPeriod: 90 },
};
export default meta;
type Story = StoryObj<typeof WorkflowHealth>;

export const WithFailures: Story = {};
export const NoHistory: Story = { args: { workflowId: "wf-facility-sync", workflowName: "Facility registry sync" } };
export const ShortRetention: Story = { args: { historyRetentionPeriod: 7 } };
