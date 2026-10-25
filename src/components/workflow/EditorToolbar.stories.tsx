import { useState } from "react";
import type { ComponentProps } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { BookOpen, History, Sparkles } from "lucide-react";
import EditorToolbar from "./EditorToolbar";
import type { EditorView } from "./EditorToolbar";
import { nationalIdWorkflow, workflowVersions } from "../../mock-data/workflow";
import { projects } from "../../mock-data/projects";

function Stateful(args: ComponentProps<typeof EditorToolbar>) {
  const [view, setView] = useState<EditorView>(args.view);
  const [name, setName] = useState(args.name);
  const [sandbox, setSandbox] = useState(args.sandbox ?? "main");
  const [open, setOpen] = useState<string | undefined>(args.trays?.find((t) => t.open)?.id);
  return (
    <EditorToolbar
      {...args}
      name={name}
      onRename={setName}
      view={view}
      onViewChange={setView}
      sandbox={sandbox}
      onSelectSandbox={setSandbox}
      trays={args.trays?.map((t) => ({ ...t, open: t.id === open }))}
      onToggleTray={(id) => setOpen((o) => (o === id ? undefined : id))}
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
    trays: [
      { id: "history", label: "Run history", icon: History, open: false },
      { id: "docs", label: "Adaptor reference", icon: BookOpen, open: false },
      { id: "assistant", label: "Assistant", icon: Sparkles, open: false, hint: "Ctrl/⌘ + K" },
    ],
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

/** With a run selected, the run button retries it. */
export const RetryAvailable: Story = {
  args: { retry: { step: "Create new citizen in Identity" }, trays: undefined },
};

export const Paused: Story = {
  args: { live: false },
};

/** A new workflow: no versions yet. */
export const NoHistory: Story = {
  args: { versions: [], name: "Untitled workflow", sandbox: projects[0].sandboxes[1] },
};
