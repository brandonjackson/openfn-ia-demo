import type { Meta, StoryObj } from "@storybook/react";
import RunEntry from "./RunEntry";
import { failedRun, olderRun, sampleRun } from "../../fixtures/runs";

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
