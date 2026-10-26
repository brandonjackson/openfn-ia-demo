import { useState } from "react";
import type { ComponentProps } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import EditorToolbar from "./EditorToolbar";
import type { EditorView } from "./EditorToolbar";
import { nationalIdWorkflow, workflowVersions } from "../../mock-data/workflow";
import { projects } from "../../mock-data/projects";

function Stateful(args: ComponentProps<typeof EditorToolbar>) {
  const [view, setView] = useState<EditorView>(args.view);
  const [name, setName] = useState(args.name);
  const [sandbox, setSandbox] = useState(args.sandbox ?? "main");
  const [assistantOpen, setAssistantOpen] = useState(args.assistantOpen ?? false);
  const [panelOpen, setPanelOpen] = useState(args.panelOpen ?? false);
  const [explorerOpen, setExplorerOpen] = useState(true);
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
      panelOpen={panelOpen}
      onTogglePanel={() => setPanelOpen((o) => !o)}
      explorerOpen={view === "code" ? explorerOpen : undefined}
      onToggleExplorer={view === "code" ? () => setExplorerOpen((o) => !o) : undefined}
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
    onTogglePanel: () => {},
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

/** With a run loaded, the run button retries it. */
export const RetryAvailable: Story = {
  args: { retry: { step: "Create new citizen in Identity" } },
};

/** The panel and assistant showing; in code mode the explorer toggle joins them. */
export const AreasOpen: Story = {
  args: { assistantOpen: true, panelOpen: true, view: "code" },
};

export const Paused: Story = {
  args: { live: false },
};

/** A new workflow: no versions yet. */
export const NoHistory: Story = {
  args: { versions: [], name: "Untitled workflow", sandbox: projects[0].sandboxes[1] },
};
