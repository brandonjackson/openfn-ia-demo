import { useState } from "react";
import type { ComponentProps } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import EditorToolbar from "./EditorToolbar";
import type { EditorView } from "./EditorToolbar";
import { nationalIdWorkflow, workflowVersions } from "../../mock-data/workflow";
import { projects } from "../../mock-data/projects";
import { sampleRun } from "../../mock-data/runs";

function Stateful(args: ComponentProps<typeof EditorToolbar>) {
  const [view, setView] = useState<EditorView>(args.view);
  const [name, setName] = useState(args.name);
  const [sandbox, setSandbox] = useState(args.sandbox ?? "main");
  const [assistantOpen, setAssistantOpen] = useState(args.assistantOpen ?? false);
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
    onToggleAssistant: () => {},
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

/** A step open: the run button runs from it. */
export const StepOpen: Story = {
  args: { fromStep: "Create new citizen in Identity", onRunFromStep: () => {} },
};

/** A step open and a run loaded that reached it. */
export const RetryFromStep: Story = {
  args: { retry: { step: "Create new citizen in Identity" }, fromStep: "Create new citizen in Identity" },
};

/** A run loaded in code mode: it sits right of the view switcher, with "Unload run". */
export const RunLoaded: Story = {
  args: { run: sampleRun, onCloseRun: () => {}, view: "code" },
};

/**
 * With the assistant open, its button folds away; the tray's close button
 * brings it back. Click the button in the default story to watch it go.
 */
export const AssistantOpen: Story = {
  args: { assistantOpen: true, view: "code" },
};

export const Paused: Story = {
  args: { live: false },
};

/** A new workflow: no versions yet. */
export const NoHistory: Story = {
  args: { versions: [], name: "Untitled workflow", sandbox: projects[0].sandboxes[1] },
};

/** Viewing an older version: the version in the title turns amber. */
export const OlderVersion: Story = {
  args: { version: "v1" },
};
