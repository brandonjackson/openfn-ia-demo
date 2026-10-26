import type { Meta, StoryObj } from "@storybook/react";
import { History } from "lucide-react";
import EditorShell from "./EditorShell";
import EditorPanel from "./EditorPanel";
import EditorTray from "./EditorTray";
import WorkflowCanvas from "./WorkflowCanvas";
import { nationalIdWorkflow } from "../../mock-data/workflow";

const meta: Meta<typeof EditorShell> = {
  title: "Workflow/EditorShell",
  component: EditorShell,
  parameters: { layout: "fullscreen" },
  decorators: [
    (Story) => (
      <div style={{ height: "100vh" }}>
        <Story />
      </div>
    ),
  ],
  args: {
    toolbar: (
      <div className="inline-flex h-10 items-center rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-700 shadow-sm">
        Toolbar
      </div>
    ),
    children: <WorkflowCanvas workflow={nationalIdWorkflow} height={760} />,
  },
};

export default meta;
type Story = StoryObj<typeof EditorShell>;

export const Default: Story = {};

export const WithTrays: Story = {
  args: {
    rightTray: (
      <EditorTray title="Run history" icon={History} placement="right">
        <p className="p-4 text-sm text-gray-500">Right tray</p>
      </EditorTray>
    ),
    bottomTray: (
      <EditorTray title="Step" placement="bottom" floating heightClass="h-40">
        <p className="p-4 text-sm text-gray-500">Bottom tray</p>
      </EditorTray>
    ),
  },
};

/** The panel docked right of the canvas, with the assistant tray outermost. */
export const WithRightPanel: Story = {
  args: {
    rightPanel: (
      <EditorPanel view="runs" onViewChange={() => {}} placement="right">
        <p className="p-4 text-sm text-gray-500">Right panel</p>
      </EditorPanel>
    ),
    rightTray: (
      <EditorTray title="Assistant" placement="right">
        <p className="p-4 text-sm text-gray-500">Right tray</p>
      </EditorTray>
    ),
  },
};

/**
 * The assistant tray runs the full height, to the right of the toolbar too.
 * Toggle `rightTrayOpen` in the controls to watch it slide in and out.
 */
export const WithAssistantTray: Story = {
  args: {
    rightTrayOpen: true,
    rightTray: (
      <EditorTray title="Assistant" placement="right">
        <p className="p-4 text-sm text-gray-500">Right tray</p>
      </EditorTray>
    ),
  },
};

export const WithCorner: Story = {
  args: { corner: <span className="block px-2 py-1 text-xs text-gray-500">⋯</span> },
};

export const Sandboxed: Story = {
  args: { sandboxed: true },
};
