import type { Meta, StoryObj } from "@storybook/react";
import VolumeBars from "./VolumeBars";
import { healthFor } from "../../../mock-data/workflow-health";

const week = healthFor("wf-openhie", "7");
const month = healthFor("wf-openhie", "30");
const day = healthFor("wf-openhie", "1");

const meta: Meta<typeof VolumeBars> = {
  title: "Projects/Health/VolumeBars",
  component: VolumeBars,
  decorators: [(Story) => <div className="w-[48rem] bg-white p-6"><Story /></div>],
  args: { buckets: week.buckets, hours: week.bucketHours, timezone: week.timezone, emptyMessage: "No runs in the last 7 days" },
};
export default meta;
type Story = StoryObj<typeof VolumeBars>;

export const SevenDays: Story = {};
export const ThirtyDays: Story = { args: { buckets: month.buckets, hours: month.bucketHours } };
export const TwentyFourHours: Story = { args: { buckets: day.buckets, hours: day.bucketHours } };
export const Empty: Story = { args: { buckets: [] } };
