import type { Meta, StoryObj } from "@storybook/react";
import { Sparkles } from "lucide-react";
import EditorShell from "./EditorShell";
import CanvasLayout from "./CanvasLayout";
import WorkflowCanvas from "../domain/WorkflowCanvas";
import { nationalIdWorkflow } from "../../fixtures/workflow";
import { adaptorInfo } from "../../fixtures/adaptor-reference";
import { connectedSystems } from "../../fixtures/connected-systems";

const meta: Meta<typeof EditorShell> = {
  title: "Patterns/EditorShell",
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
    children: (
      <CanvasLayout>
        <WorkflowCanvas workflow={nationalIdWorkflow} adaptors={adaptorInfo} systems={connectedSystems} height={760} />
      </CanvasLayout>
    ),
  },
};

export default meta;
type Story = StoryObj<typeof EditorShell>;

export const Default: Story = {};

/** The toolbar floats over the canvas, which runs the full height and pans beneath it. */
export const FloatingToolbar: Story = {
  args: { floatToolbar: true },
};

/**
 * The side column, here the assistant, runs the full height, to the right of
 * the toolbar too, a level above the canvas or code. Toggle `sideOpen` in
 * the controls to watch it slide in and out.
 */
export const WithSide: Story = {
  args: {
    sideOpen: true,
    sideTitle: "Assistant",
    sideIcon: Sparkles,
    onCloseSide: () => {},
    side: <p className="p-4 text-sm text-gray-500">Side column</p>,
  },
};

export const Sandboxed: Story = {
  args: { accentEdge: true },
};
