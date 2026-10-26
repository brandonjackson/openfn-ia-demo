import type { Meta, StoryObj } from "@storybook/react";
import ReferenceChip from "./ReferenceChip";

const meta: Meta<typeof ReferenceChip> = {
  title: "Workflow/ReferenceChip",
  component: ReferenceChip,
  parameters: { layout: "padded" },
};

export default meta;
type Story = StoryObj<typeof ReferenceChip>;

export const Step: Story = {
  args: { reference: { kind: "step", id: "search", label: "Search for duplicate citizens in Identity", adaptor: "http" }, onRemove: () => {} },
};
export const Trigger: Story = {
  args: { reference: { kind: "trigger", id: "trigger", label: "Webhook trigger" }, onRemove: () => {} },
};
/** In a sent message the chip can't be removed. */
export const Sent: Story = {
  args: { reference: { kind: "step", id: "create", label: "Create new citizen in Identity", adaptor: "http" } },
};
