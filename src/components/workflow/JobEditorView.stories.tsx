import type { Meta, StoryObj } from "@storybook/react";
import JobEditorView from "./JobEditorView";
import RecentHistoryPanel from "./RecentHistoryPanel";
import { nationalIdWorkflow, type JobNode } from "../../mock-data/workflow";
import { dataclips, failedRun, sampleRun, workOrders } from "../../mock-data/runs";

const job = (id: string) => nationalIdWorkflow.nodes.find((n) => n.id === id) as JobNode;

const meta: Meta<typeof JobEditorView> = {
  title: "Workflow/JobEditorView",
  component: JobEditorView,
  parameters: { layout: "fullscreen" },
  args: {
    dataclips,
    historyPanel: <RecentHistoryPanel workOrders={workOrders} latestVersion="v2" />,
  },
  decorators: [
    (Story) => (
      <div style={{ height: "100vh" }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof JobEditorView>;

/** Following a step of the selected run: its logs, input and output. */
export const FollowingRun: Story = {
  args: { job: job("search"), run: sampleRun },
};

/** The step that failed in a failed run. */
export const FailedStep: Story = {
  args: { job: job("create"), run: failedRun },
};

/** The open job wasn't part of the selected run. */
export const StepNotInRun: Story = {
  args: { job: job("queue"), run: sampleRun },
};

/** No run selected yet. */
export const NoRun: Story = {
  args: { job: job("search") },
};
