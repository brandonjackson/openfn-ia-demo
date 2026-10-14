import type { Meta, StoryObj } from "@storybook/react";
import { runLogs } from "../../mock-data/history";
import LogViewer from "./LogViewer";

const meta = {
  title: "History/LogViewer",
  component: LogViewer,
  decorators: [(Story) => <div className="flex h-96">{Story()}</div>],
} satisfies Meta<typeof LogViewer>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: { logs: runLogs["run-1"], finished: true } };
export const StepSelected: Story = { args: { logs: runLogs["run-1"], finished: true, selectedStepId: "step-1b" } };
export const Errors: Story = { args: { logs: runLogs["run-2"], finished: true, defaultLevel: "error" } };
export const Waiting: Story = { args: { logs: [], finished: false, waitingMessage: "Waiting for worker" } };
export const NoLogs: Story = { args: { logs: [], finished: true } };
