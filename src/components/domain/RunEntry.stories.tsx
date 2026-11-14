import type { Meta, StoryObj } from "@storybook/react";
import RunEntry from "./RunEntry";
import { failedRun, hardshipGrantWorkOrders, olderRun, sampleRun, waitingRun } from "../../fixtures/runs";

const meta: Meta<typeof RunEntry> = {
  title: "Domain/RunEntry",
  component: RunEntry,
  args: { latestVersion: "v2", onInspect: () => {}, onRetryFromStep: () => {} },
};

export default meta;
type Story = StoryObj<typeof RunEntry>;

export const Succeeded: Story = { args: { run: sampleRun } };

/** The step it failed at says why. */
export const Failed: Story = { args: { run: failedRun } };

/** A run on an older version of the workflow gets a yellow tag. */
export const OlderVersion: Story = { args: { run: olderRun } };

/** Still waiting for a worker, so it can be cancelled. */
export const Enqueued: Story = {
  args: { run: { ...sampleRun, status: "pending", steps: [], duration: "", when: "just now" }, onCancel: () => {} },
};

export const Cancelled: Story = {
  args: { run: { ...sampleRun, status: "cancelled", steps: [], duration: "", when: "just now" } },
};

/** Without permission to run the workflow: no retry from a step. */
export const ReadOnly: Story = { args: { run: failedRun, onRetryFromStep: undefined } };

/** Waiting on a Human in the loop step: what it asks, to approve or reject here. */
export const WaitingOnSomeone: Story = {
  args: { run: waitingRun, latestVersion: "v1", onAnswer: () => new Promise((resolve) => setTimeout(resolve, 600)) },
};

/** Waiting, for someone who can't answer it. */
export const WaitingReadOnly: Story = { args: { run: waitingRun, latestVersion: "v1" } };

/** Declined by the officer: a successful run with a Refused outcome, and who answered on the step. */
export const WithOutcome: Story = {
  args: { run: hardshipGrantWorkOrders.find((o) => o.outcome?.status === "refused" && o.runs[0].steps.some((s) => s.answer))!.runs[0], latestVersion: "v1" },
};
