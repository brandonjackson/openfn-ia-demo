import type { Meta, StoryObj } from "@storybook/react";
import DiagramControls from "./DiagramControls";
import { withCanvas } from "../../stories/decorators";

const noop = () => {};
const meta: Meta<typeof DiagramControls> = {
  title: "Workflow/DiagramControls",
  component: DiagramControls,
  decorators: [withCanvas("h-72")],
  args: {
    onZoomIn: noop,
    onZoomOut: noop,
    onFitView: noop,
    isManualLayout: false,
    onToggleLayout: noop,
    onAutoLayout: noop,
    canUndo: false,
    canRedo: false,
    onUndo: noop,
    onRedo: noop,
  },
};
export default meta;
type Story = StoryObj<typeof DiagramControls>;

export const AutoLayout: Story = {};
export const ManualLayoutWithHistory: Story = { args: { isManualLayout: true, canUndo: true } };
