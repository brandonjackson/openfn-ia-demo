import { useState } from "react";
import type { ComponentProps } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import EditorToolbar from "./EditorToolbar";
import type { EditorView } from "./EditorToolbar";
import type { RunDetails } from "../../mock-data/workflow";
import { nationalIdWorkflow, workflowVersions } from "../../mock-data/workflow";
import { projects } from "../../mock-data/projects";
import { sampleRun, workOrders } from "../../mock-data/runs";

function Stateful(args: ComponentProps<typeof EditorToolbar>) {
  const [view, setView] = useState<EditorView>(args.view);
  const [name, setName] = useState(args.name);
  const [sandbox, setSandbox] = useState(args.sandbox ?? "main");
  const [assistantOpen, setAssistantOpen] = useState(args.assistantOpen ?? false);
  const [run, setRun] = useState<RunDetails | undefined>(args.selectedRun);
  return (
    <EditorToolbar
      {...args}
      name={name}
      onRename={setName}
      view={view}
      onViewChange={setView}
      sandbox={sandbox}
      onSelectSandbox={setSandbox}
      assistantOpen={assistantOpen}
      onToggleAssistant={() => setAssistantOpen((o) => !o)}
      selectedRun={run}
      onSelectRun={setRun}
      onDeselectRun={() => setRun(undefined)}
      retry={run ? { step: args.retry?.step } : undefined}
    />
  );
}

const meta: Meta<typeof EditorToolbar> = {
  title: "Workflow/EditorToolbar",
  component: EditorToolbar,
  parameters: { layout: "fullscreen" },
  decorators: [
    (Story) => (
      <div className="h-80 bg-gray-50 bg-[radial-gradient(theme(colors.gray.200)_1px,transparent_1px)] p-4 [background-size:22px_22px]">
        <Story />
      </div>
    ),
  ],
  args: {
    name: nationalIdWorkflow.name,
    projectName: "Project A",
    sandboxes: projects[0].sandboxes,
    versions: workflowVersions,
    view: "canvas",
    onMenuAction: () => {},
    onNewSandbox: () => {},
    onViewAllSandboxes: () => {},
    workOrders,
  },
  render: (args) => <Stateful {...args} />,
};

export default meta;
type Story = StoryObj<typeof EditorToolbar>;

/** On main: read-only, with "Edit in sandbox" as the main action. */
export const OnMain: Story = {};

/** In a sandbox: the chip turns amber and the main action is "Go live". */
export const InSandbox: Story = {
  args: { sandbox: projects[0].sandboxes[1], view: "code" },
};

export const Renaming: Story = {
  args: { sandbox: projects[0].sandboxes[1], defaultRenaming: true },
};

/** With a run loaded, the run picker names it and the run button retries it. */
export const RunLoaded: Story = {
  args: { selectedRun: sampleRun, retry: { step: "Create new citizen in Identity" } },
};

export const AssistantOpen: Story = {
  args: { assistantOpen: true },
};

export const Paused: Story = {
  args: { live: false },
};

/** A new workflow: no versions yet. */
export const NoHistory: Story = {
  args: { versions: [], name: "Untitled workflow", sandbox: projects[0].sandboxes[1] },
};
