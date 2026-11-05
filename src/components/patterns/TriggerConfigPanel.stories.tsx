import type { Meta, StoryObj } from "@storybook/react";
import TriggerConfigPanel from "./TriggerConfigPanel";
import { nationalIdWorkflow } from "../../fixtures/workflow";
import type { TriggerNode } from "../../model/workflow";
import { projects } from "../../fixtures/projects";

const trigger = nationalIdWorkflow.nodes.find((n) => n.type === "trigger") as TriggerNode;

const meta: Meta<typeof TriggerConfigPanel> = {
  title: "Patterns/TriggerConfigPanel",
  component: TriggerConfigPanel,
  decorators: [
    (Story) => (
      <div className="h-[640px] w-80 border border-gray-200 bg-white">
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

/** Published as a service: its annotations generate the OpenAPI 3 docs. */
export const PublishedAsService: Story = {
  args: { service: projects.find((p) => p.id === "case-surveillance")!.services[0] },
};
