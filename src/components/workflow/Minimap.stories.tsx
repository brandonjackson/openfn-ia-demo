import type { Meta, StoryObj } from "@storybook/react";
import Minimap from "./Minimap";
import { nationalIdWorkflow } from "../../mock-data/workflow";

const meta: Meta<typeof Minimap> = {
  title: "Workflow/Minimap",
  component: Minimap,
  parameters: { layout: "centered" },
};

export default meta;
type Story = StoryObj<typeof Minimap>;

export const Default: Story = { args: { workflow: nationalIdWorkflow } };
