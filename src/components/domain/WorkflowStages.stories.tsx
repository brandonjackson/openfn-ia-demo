import type { Meta, StoryObj } from "@storybook/react";
import WorkflowStages from "./WorkflowStages";
import { lifecycleStages, type LifecycleFacts } from "../../model/workflow-lifecycle";

const meta: Meta<typeof WorkflowStages> = {
  title: "Domain/WorkflowStages",
  component: WorkflowStages,
  decorators: [(Story) => <div style={{ height: 560 }}><Story /></div>],
};
export default meta;
type Story = StoryObj<typeof WorkflowStages>;

const noop = () => undefined;
const links = {
  problem: { label: "context.md", onOpen: noop },
  proposal: { label: "spec.md", onOpen: noop },
  build: { label: "Verify birth registration", onOpen: noop },
  test: { label: "Test cases", onOpen: noop },
  live: { label: "Create promotion request", onOpen: noop },
  evaluate: { label: "Health", onOpen: noop },
  share: { label: "Add service.yaml", onOpen: noop },
};
const fresh: LifecycleFacts = {
  hasContext: false,
  hasSpec: false,
  stepCount: 0,
  testedOk: false,
  onMain: false,
  live: false,
  hasRuns: false,
  published: false,
  canPublish: true,
};

/** A new workflow, with nothing written down yet. */
export const JustStarted: Story = {
  args: {
    stages: lifecycleStages(fresh),
    links: { problem: { label: "Add context", onOpen: noop }, proposal: { label: "Add spec", onOpen: noop }, build: { label: "Add a step", onOpen: noop } },
  },
};

/** In a sandbox, described and built, with a test case still failing. */
export const Testing: Story = {
  args: { stages: lifecycleStages({ ...fresh, hasContext: true, hasSpec: true, stepCount: 3, tests: { total: 4, passed: 3 } }), links },
};

/** Without the Test cases flag, testing is running it with a sample. */
export const TestingWithoutTestCases: Story = {
  args: {
    stages: lifecycleStages({ ...fresh, hasContext: true, hasSpec: true, stepCount: 3 }),
    links: { ...links, test: { label: "Run it", onOpen: noop } },
    testCases: false,
  },
};

/** Live on main, with runs to look back on, and not yet a service. */
export const ReadyToShare: Story = {
  args: {
    stages: lifecycleStages({ ...fresh, hasContext: true, hasSpec: true, stepCount: 3, testedOk: true, onMain: true, live: true, hasRuns: true }),
    links: { ...links, live: { label: "Webhook trigger", onOpen: noop }, share: undefined },
    onMain: true,
  },
};

/** Every stage done: it's back to evaluating, as the cycle goes round. */
export const AllDone: Story = {
  args: {
    stages: lifecycleStages({ ...fresh, hasContext: true, hasSpec: true, stepCount: 3, testedOk: true, onMain: true, live: true, hasRuns: true, published: true }),
    links: { ...links, live: { label: "Webhook trigger", onOpen: noop }, share: { label: "service.yaml", onOpen: noop } },
    onMain: true,
  },
};

/** Where a workflow can't be published as a service, Share lessons is left out. */
export const WithoutServices: Story = {
  args: { stages: lifecycleStages({ ...fresh, hasContext: true, canPublish: false }), links },
};
