import type { Meta, StoryObj } from "@storybook/react";
import { findWorkflowGraph } from "../../mock-data/workflow";
import DiagramMiniMap from "./DiagramMiniMap";

const meta: Meta<typeof DiagramMiniMap> = {
  title: "Workflow/DiagramMiniMap",
  component: DiagramMiniMap,
  decorators: [(Story) => <div className="relative h-56 bg-gray-100"><Story /></div>],
  args: {
    graph: findWorkflowGraph("wf-openhie")!,
    viewport: { x: 600, y: 90, zoom: 0.7 },
    canvasSize: { width: 1248, height: 820 },
  },
};
export default meta;
type Story = StoryObj<typeof DiagramMiniMap>;

export const FitToView: Story = {};
export const ZoomedIn: Story = { args: { viewport: { x: 500, y: -200, zoom: 1 } } };
