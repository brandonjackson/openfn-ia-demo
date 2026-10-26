import type { Meta, StoryObj } from "@storybook/react";
import StepInspector from "./StepInspector";
import LayoutMenu from "./LayoutMenu";
import { defaultLayout } from "../../editor-layout";
import { nationalIdWorkflow } from "../../mock-data/workflow";
import type { JobNode } from "../../mock-data/workflow";
import { dataclips, failedRun, sampleRun } from "../../mock-data/runs";

const job = (id: string) => nationalIdWorkflow.nodes.find((n): n is JobNode => n.type === "job" && n.id === id)!;
const trigger = nationalIdWorkflow.nodes.find((n) => n.type === "trigger")!;

const meta: Meta<typeof StepInspector> = {
  title: "Workflow/StepInspector",
  component: StepInspector,
  parameters: { layout: "fullscreen" },
  args: {
    node: job("search"),
    dataclips,
    url: "https://app.openfn.org/i/8f3c2a1e",
    onChange: () => {},
    onOpenCode: () => {},
    onRunFromHere: () => {},
    onDelete: () => {},
    onOpenPanel: () => {},
    onBrowseRuns: () => {},
    onClose: () => {},
    actions: <LayoutMenu layout={defaultLayout} onChange={() => {}} view="canvas" />,
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

/** A step in a sandbox with no run loaded: its name, adaptor and a way to the runs. */
export const Default: Story = {};

/** The step needs a credential it doesn't have yet. */
export const NeedsCredential: Story = {
  args: { node: job("create") },
};

/** On main: read-only, with the credential named. */
export const ReadOnly: Story = {
  args: { readOnly: true, credentialId: "cred-identity-prod", onChange: undefined, onDelete: undefined },
};

/** A run loaded: the step's log, input and output as snippets. */
export const WithRun: Story = {
  args: { run: sampleRun, credentialId: "cred-identity-prod" },
};

/** The failed step, with its log telling why. */
export const FailedStep: Story = {
  args: { node: job("create"), run: failedRun, credentialId: "cred-identity-prod" },
};

/** The log expanded to full width, the other sections folded. */
export const LogExpanded: Story = {
  args: { run: sampleRun, credentialId: "cred-identity-prod", defaultExpanded: "log" },
};

/** The output expanded to full width. */
export const OutputExpanded: Story = {
  args: { run: sampleRun, credentialId: "cred-identity-prod", defaultExpanded: "output" },
};

/** A step the loaded run never reached. */
export const NotInRun: Story = {
  args: { node: job("notify"), run: failedRun },
};

/** The trigger: its type, webhook URL and switch. */
export const Trigger: Story = {
  args: { node: trigger, onOpenCode: undefined, onRunFromHere: undefined, onDelete: undefined, onToggleLive: () => {} },
};

/** The trigger with a run loaded: the run's input and its own log lines. */
export const TriggerWithRun: Story = {
  args: { ...Trigger.args, run: sampleRun },
};
