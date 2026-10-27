import type { Meta, StoryObj } from "@storybook/react";
import StepInspector from "./StepInspector";
import { nationalIdWorkflow } from "../../mock-data/workflow";
import type { JobNode } from "../../mock-data/workflow";
import { dataclips, failedRun, failureReasons, runActivity, sampleRun, workOrders } from "../../mock-data/runs";

const job = (id: string) => nationalIdWorkflow.nodes.find((n): n is JobNode => n.type === "job" && n.id === id)!;
const trigger = nationalIdWorkflow.nodes.find((n) => n.type === "trigger")!;

const activity = runActivity(nationalIdWorkflow, workOrders, "30d");
const statsFor = (id?: string) => ({
  period: "30d" as const,
  runs: id ? activity.nodes[id].runs : activity.runs,
  failed: id ? activity.nodes[id].failed : activity.failed,
  reasons: failureReasons(nationalIdWorkflow, workOrders, "30d", id),
});

const meta: Meta<typeof StepInspector> = {
  title: "Workflow/StepInspector",
  component: StepInspector,
  parameters: { layout: "fullscreen" },
  args: {
    node: job("search"),
    dataclips,
    url: "https://app.openfn.org/i/8f3c2a1e",
    latestVersion: "v2",
    onChange: () => {},
    onOpenCode: () => {},
    onRunFromHere: () => {},
    onDelete: () => {},
    onClose: () => {},
    onUnloadRun: () => {},
    onExpand: () => {},
    onSelectRun: () => {},
  },
  decorators: [
    (Story) => (
      <div className="relative h-[720px] bg-gray-50 bg-[radial-gradient(theme(colors.gray.200)_1px,transparent_1px)] [background-size:22px_22px]">
        <div className="absolute bottom-4 right-4 top-3 flex items-start justify-end">
          <Story />
        </div>
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof StepInspector>;

/** No runs on the canvas: the step's adaptor and credential, then what its code does, summarised by the assistant. Click the title to rename the step. */
export const Default: Story = {};

/** The step needs a credential it doesn't have yet. */
export const NeedsCredential: Story = {
  args: { node: job("create") },
};

/** On main: read-only, with the credential named. */
export const ReadOnly: Story = {
  args: { readOnly: true, credentialId: "cred-identity-prod", onChange: undefined, onDelete: undefined },
};

/** A step whose code has nothing in it yet: the summary says so. */
export const EmptyStep: Story = {
  args: {
    node: { ...job("queue"), id: "step-new", label: "Untitled step", body: "// Start writing your step here" },
  },
};

/** Run history on the canvas: the config and summary stay on top, then the step's runs, failures and why they failed, over the canvas's period. */
export const Stats: Story = {
  args: { node: job("create"), stats: statsFor("create") },
};

/** A step that hasn't failed in the period. */
export const StatsNoFailures: Story = {
  args: { node: job("confirm"), stats: statsFor("confirm") },
};

/** No runs reached the step in the period. */
export const StatsNoRuns: Story = {
  args: { node: job("notify"), stats: { period: "24h", runs: 0, failed: 0, reasons: [] } },
};

/** The trigger under run history: the whole workflow's numbers. */
export const TriggerStats: Story = {
  args: { node: trigger, onOpenCode: undefined, onRunFromHere: undefined, onDelete: undefined, stats: statsFor() },
};

/** A run loaded: the step's log, input and output as snippets that open in the code view. */
export const WithRun: Story = {
  args: { run: sampleRun, credentialId: "cred-identity-prod" },
};

/** The failed step, with its log telling why. */
export const FailedStep: Story = {
  args: { node: job("create"), run: failedRun, credentialId: "cred-identity-prod" },
};

/** A step the loaded run never reached. */
export const NotInRun: Story = {
  args: { node: job("notify"), run: failedRun },
};

/** The trigger with no runs on the canvas: its type, webhook URL and switch. */
export const Trigger: Story = {
  args: { node: trigger, onOpenCode: undefined, onRunFromHere: undefined, onDelete: undefined, onToggleLive: () => {} },
};

/** The trigger with a run loaded: the run's input and its own log lines. */
export const TriggerWithRun: Story = {
  args: { ...Trigger.args, run: sampleRun },
};
