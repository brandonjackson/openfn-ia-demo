import type { Meta, StoryObj } from "@storybook/react";
import { withRouter, withGrayPanel } from "../../stories/decorators";
import { findRun } from "../../mock-data/history";
import { historyRun } from "../../mock-data/history-extra";
import { RunCard, StepListItem } from "./RunDetails";

const meta = {
  title: "History/RunCard",
  component: RunCard,
  decorators: [withRouter, withGrayPanel],
} satisfies Meta<typeof RunCard>;
export default meta;
type Story = StoryObj<typeof meta>;

const run = (id: string) => historyRun(findRun(id)!);

const base = { projectId: "p", workflowId: "wf-openhie", showPrevious: false, onTogglePrevious: () => {} };

export const SingleRun: Story = { args: { ...base, run: run("run-1"), index: 1, total: 1 } };
export const LatestOfTwo: Story = {
  args: { ...base, workflowId: "wf-referrals", run: run("run-3"), index: 2, total: 2 },
};
export const FailedRun: Story = {
  args: { ...base, workflowId: "wf-referrals", run: run("run-2"), index: 1, total: 2 },
};
export const Running: Story = { args: { ...base, run: run("run-4"), index: 1, total: 1 } };

export const OneStep: Story = {
  args: { ...base, run: run("run-1"), index: 1, total: 1 },
  render: () => <StepListItem step={run("run-1").steps[0]} run={run("run-1")} projectId="p" workflowId="wf-openhie" />,
};
