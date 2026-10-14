import type { Meta, StoryObj } from "@storybook/react";
import { findWorkflowGraph } from "../../mock-data/workflow";
import TriggerInspector, { TriggerTypeBadge } from "./TriggerInspector";

const meta: Meta<typeof TriggerInspector> = {
  title: "Workflow/TriggerInspector",
  component: TriggerInspector,
  decorators: [(Story) => <div className="bg-gray-100 h-[600px] flex justify-end"><Story /></div>],
  args: { trigger: findWorkflowGraph("wf-openhie")!.triggers[0], onChange: () => {}, onClose: () => {} },
};
export default meta;
type Story = StoryObj<typeof TriggerInspector>;

export const Webhook: Story = {};
export const WebhookWithAuth: Story = { args: { trigger: { ...findWorkflowGraph("wf-openhie")!.triggers[0], hasAuthMethod: true } } };
export const Cron: Story = { args: { trigger: findWorkflowGraph("wf-referrals")!.triggers[0] } };
export const Badges: Story = {
  render: () => (
    <div className="flex gap-2 p-4">
      <TriggerTypeBadge />
      <TriggerTypeBadge type="cron" />
    </div>
  ),
};
