import type { Meta, StoryObj } from "@storybook/react";
import TriggerTypePicker from "./TriggerTypePicker";

const meta: Meta<typeof TriggerTypePicker> = {
  title: "Domain/TriggerTypePicker",
  component: TriggerTypePicker,
  args: { open: true, current: "webhook", onPick: () => {}, onClose: () => {} },
};

export default meta;
type Story = StoryObj<typeof TriggerTypePicker>;

/** From a webhook: it says what turning it into a cron takes away. */
export const FromWebhook: Story = {};
/** From a cron. */
export const FromCron: Story = { args: { current: "cron" } };
