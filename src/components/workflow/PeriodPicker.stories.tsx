import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import PeriodPicker from "./PeriodPicker";
import type { ActivityPeriod } from "../../mock-data/runs";

function Stateful({ value: initial, compact }: { value: ActivityPeriod; compact?: boolean }) {
  const [value, setValue] = useState<ActivityPeriod>(initial);
  return <PeriodPicker value={value} onChange={setValue} compact={compact} />;
}

const meta: Meta<typeof PeriodPicker> = {
  title: "Workflow/PeriodPicker",
  component: PeriodPicker,
  parameters: { layout: "padded" },
  render: (args) => <Stateful value={args.value} compact={args.compact} />,
};

export default meta;
type Story = StoryObj<typeof PeriodPicker>;

export const Default: Story = { args: { value: "7d" } };
export const LastDay: Story = { args: { value: "24h" } };
export const Compact: Story = { args: { value: "7d", compact: true } };
