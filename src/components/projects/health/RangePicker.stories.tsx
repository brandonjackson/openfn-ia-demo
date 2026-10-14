import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import RangePicker from "./RangePicker";

const meta: Meta<typeof RangePicker> = {
  title: "Projects/Health/RangePicker",
  component: RangePicker,
  render: function Render(args) {
    const [days, setDays] = useState(args.days);
    return <RangePicker {...args} days={days} onChange={setDays} />;
  },
  args: { days: "7", onChange: () => {} },
};
export default meta;
type Story = StoryObj<typeof RangePicker>;

export const Default: Story = {};
export const ShortRetention: Story = { args: { retentionDays: 7 } };
