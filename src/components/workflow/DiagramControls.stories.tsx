import type { Meta, StoryObj } from "@storybook/react";
import DiagramControls from "./DiagramControls";

const noop = () => {};
const meta: Meta<typeof DiagramControls> = {
  title: "Workflow/DiagramControls",
  component: DiagramControls,
  decorators: [(Story) => <div className="relative h-72 bg-gray-100"><Story /></div>],
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
