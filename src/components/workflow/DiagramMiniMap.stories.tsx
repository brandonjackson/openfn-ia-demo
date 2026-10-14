import type { Meta, StoryObj } from "@storybook/react";
import { findWorkflowGraph } from "../../mock-data/workflow";
import DiagramMiniMap from "./DiagramMiniMap";
import { withCanvas } from "../../stories/decorators";

const meta: Meta<typeof DiagramMiniMap> = {
  title: "Workflow/DiagramMiniMap",
  component: DiagramMiniMap,
  decorators: [withCanvas("h-56")],
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
