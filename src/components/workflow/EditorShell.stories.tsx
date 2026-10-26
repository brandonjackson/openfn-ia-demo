import type { Meta, StoryObj } from "@storybook/react";
import { History } from "lucide-react";
import EditorShell from "./EditorShell";
import EditorTray from "./EditorTray";
import WorkflowCanvas from "./WorkflowCanvas";
import ReadOnlyNotice from "./ReadOnlyNotice";
import CanvasRunsBar from "./CanvasRunsBar";
import { nationalIdWorkflow } from "../../mock-data/workflow";
import { runActivity, workOrders } from "../../mock-data/runs";

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

export const WithTray: Story = {
  args: {
    rightTray: (
      <EditorTray title="Run history" icon={History} placement="right">
        <p className="p-4 text-sm text-gray-500">Right tray</p>
      </EditorTray>
    ),
  },
};

/** The canvas's runs bar centred over the top of the main surface. */
export const WithTop: Story = {
  args: {
    top: (
      <CanvasRunsBar
        period="7d"
        onPeriodChange={() => {}}
        showing
        onShowingChange={() => {}}
        status="all"
        onStatusChange={() => {}}
        activity={runActivity(nationalIdWorkflow, workOrders)}
        workOrders={workOrders}
        open={false}
        onOpenChange={() => {}}
      />
    ),
  },
};

/** Main's read-only notice pinned to the bottom of the main surface. */
export const WithBottom: Story = {
  args: { bottom: <ReadOnlyNotice onEditInSandbox={() => {}} /> },
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

/** A card floating over the right of the canvas, e.g. the inspector. */
export const WithRightOverlay: Story = {
  args: {
    rightOverlay: (
      <div className="w-[380px] rounded-xl border border-gray-200 bg-white p-4 shadow-xl">
        <p className="text-sm text-gray-500">Right overlay</p>
      </div>
    ),
  },
};

export const Sandboxed: Story = {
  args: { sandboxed: true },
};
