import type { Meta, StoryObj } from "@storybook/react";
import TriggerConfigPanel from "./TriggerConfigPanel";
import { nationalIdWorkflow } from "../../mock-data/workflow";
import type { TriggerNode } from "../../mock-data/workflow";

const trigger = nationalIdWorkflow.nodes.find((n) => n.type === "trigger") as TriggerNode;

const meta: Meta<typeof TriggerConfigPanel> = {
  title: "Workflow/TriggerConfigPanel",
  component: TriggerConfigPanel,
  decorators: [
    (Story) => (
      <div className="h-[420px] w-80 border border-gray-200 bg-white">
        <Story />
      </div>
    ),
  ],
  args: { trigger, url: "https://app.openfn.org/i/8f3c2a1e", onToggleLive: () => {} },
};

export default meta;
type Story = StoryObj<typeof TriggerConfigPanel>;

export const Default: Story = {};
export const ReadOnly: Story = { args: { readOnly: true } };
export const Paused: Story = { args: { live: false } };
