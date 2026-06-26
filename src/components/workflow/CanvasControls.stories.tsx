import type { Meta, StoryObj } from "@storybook/react";
import CanvasControls from "./CanvasControls";

const meta: Meta<typeof CanvasControls> = {
  title: "Workflow/CanvasControls",
  component: CanvasControls,
  parameters: { layout: "centered" },
};

export default meta;
type Story = StoryObj<typeof CanvasControls>;

export const Default: Story = {};
