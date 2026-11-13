import type { Meta, StoryObj } from "@storybook/react";
import WorkflowStages from "./WorkflowStages";
import { lifecycleStages } from "../../model/workflow-lifecycle";

const meta: Meta<typeof WorkflowStages> = {
  title: "Domain/WorkflowStages",
  component: WorkflowStages,
  decorators: [(Story) => <div style={{ height: 520 }}><Story /></div>],
};
export default meta;
type Story = StoryObj<typeof WorkflowStages>;

const noop = () => undefined;
const links = {
  describe: { label: "context.md", onOpen: noop },
  build: { label: "Search applications", onOpen: noop },
  test: { label: "Saved dataclips", onOpen: noop },
  live: { label: "Create promotion request", onOpen: noop },
  monitor: { label: "Health", onOpen: noop },
};

/** In a sandbox, built and described but not yet run. */
export const Testing: Story = {
  args: {
    stages: lifecycleStages({ described: true, stepCount: 3, testedOk: false, onMain: false, live: false }),
    links,
  },
};

/** A new workflow, with nothing written down yet. */
export const JustStarted: Story = {
  args: {
    stages: lifecycleStages({ described: false, stepCount: 0, testedOk: false, onMain: false, live: false }),
    links: { describe: { label: "Add context", onOpen: noop }, build: { label: "Add a step", onOpen: noop } },
  },
};

/** On main, tested, with its trigger off. */
export const ReadyToGoLive: Story = {
  args: {
    stages: lifecycleStages({ described: true, stepCount: 3, testedOk: true, onMain: true, live: false }),
    links: { ...links, live: { label: "Webhook", onOpen: noop } },
    onMain: true,
  },
};

/** Live on main: all that's left is keeping an eye on it. */
export const Live: Story = {
  args: {
    stages: lifecycleStages({ described: true, stepCount: 3, testedOk: true, onMain: true, live: true }),
    links: { ...links, live: { label: "Webhook", onOpen: noop } },
    onMain: true,
  },
};
