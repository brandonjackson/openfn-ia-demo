import { useState } from "react";
import type { ComponentProps } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import WorkflowTopBar from "./WorkflowTopBar";
import { nationalIdWorkflow, workflowVersions } from "../../mock-data/workflow";
import { projects, serviceForWorkflow } from "../../mock-data/projects";

const sandboxes = projects[0].sandboxes;
const retryStep = nationalIdWorkflow.nodes[1].label;
const service = serviceForWorkflow("planning-application-workflow");

/** Keeps sandbox and version in state so the pickers and actions respond. */
function ControlledTopBar(args: ComponentProps<typeof WorkflowTopBar>) {
  const [sandbox, setSandbox] = useState(args.sandbox ?? "main");
  const [version, setVersion] = useState(args.version ?? "latest");
  return (
    <WorkflowTopBar
      {...args}
      sandbox={sandbox}
      onSelectSandbox={setSandbox}
      version={version}
      onSelectVersion={setVersion}
      onEditInSandbox={() => setSandbox(sandboxes[1])}
      onPromote={() => setSandbox("main")}
    />
  );
}

const meta: Meta<typeof WorkflowTopBar> = {
  title: "Workflow/WorkflowTopBar",
  component: WorkflowTopBar,
  parameters: { layout: "fullscreen" },
  args: {
    workflow: nationalIdWorkflow,
    sandboxes,
    versions: workflowVersions,
    url: service?.url,
    onSeeDetails: () => {},
  },
  decorators: [
    (Story) => (
      <div className="h-96">
        <Story />
      </div>
    ),
  ],
  render: (args) => <ControlledTopBar {...args} />,
};

export default meta;
type Story = StoryObj<typeof WorkflowTopBar>;

/** On main the workflow is read-only; the action is "Edit in sandbox". */
export const OnMain: Story = {};

/** In a sandbox the action is "Promote". */
export const InSandbox: Story = { args: { sandbox: sandboxes[1] } };

export const RetryRun: Story = { args: { retry: { step: retryStep } } };

/** Viewing v1 as a past run executed it: the version picker turns yellow. */
export const ViewingOlderVersion: Story = {
  args: { version: "v1", retry: { hint: "Runs this input on the latest version (v2), not v1" } },
};

export const WithBackButton: Story = { args: { onBack: () => {} } };

export const VersionPickerOpen: Story = {
  play: async ({ canvasElement }) => {
    canvasElement.querySelector<HTMLButtonElement>('[aria-label="Switch version"]')?.click();
  },
};

export const SandboxPickerOpen: Story = {
  args: { onViewAllSandboxes: () => {} },
  play: async ({ canvasElement }) => {
    canvasElement.querySelector<HTMLButtonElement>('[aria-label="Switch sandbox"]')?.click();
  },
};

export const PromoteDialogOpen: Story = {
  args: { sandbox: sandboxes[1], defaultPromoteOpen: true },
};

export const Disabled: Story = { args: { defaultLive: false } };

/** The chat button fills in while the AI Assistant tray is open. */
export const AssistantOpen: Story = { args: { assistantOpen: true } };
