import type { Meta, StoryObj } from "@storybook/react";
import TriggerConfigPanel from "./TriggerConfigPanel";
import { nationalIdWorkflow } from "../../fixtures/workflow";
import type { TriggerNode } from "../../model/workflow";
import { projects } from "../../fixtures/projects";

const trigger = nationalIdWorkflow.nodes.find((n) => n.type === "trigger") as TriggerNode;

const meta: Meta<typeof TriggerConfigPanel> = {
  title: "Domain/TriggerConfigPanel",
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
/** On main: the fields only read, but the switch still pauses and resumes the workflow. */
export const ReadOnly: Story = { args: { readOnly: true } };
/** With nothing to turn it on or off (no `onToggleLive`), the switch only reads. */
export const SwitchReadsOnly: Story = { args: { readOnly: true, onToggleLive: undefined } };
export const Paused: Story = { args: { live: false } };

/** Published as a service: its annotations generate the OpenAPI 3 docs. */
export const PublishedAsService: Story = {
  args: { service: projects.find((p) => p.id === "case-surveillance")!.services[0] },
};

/** Without the service catalog: a webhook carries no service annotations. */
export const WithoutServiceAnnotations: Story = { args: { showServiceAnnotations: false } };
