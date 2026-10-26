import type { Meta, StoryObj } from "@storybook/react";
import TriggerPill from "./TriggerPill";

const meta: Meta<typeof TriggerPill> = {
  title: "Workflow/TriggerPill",
  component: TriggerPill,
  parameters: { layout: "padded" },
};

export default meta;
type Story = StoryObj<typeof TriggerPill>;

export const Webhook: Story = { args: { triggerType: "webhook" } };
export const Cron: Story = { args: { triggerType: "cron" } };
export const Kafka: Story = { args: { triggerType: "kafka" } };
export const Compact: Story = { args: { triggerType: "webhook", compact: true } };
