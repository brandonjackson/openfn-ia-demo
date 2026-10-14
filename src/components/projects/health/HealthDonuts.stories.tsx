import type { Meta, StoryObj } from "@storybook/react";
import { FailureBreakdownDonut, OutcomesDonut } from "./HealthDonuts";
import { healthFor } from "../../../mock-data/workflow-health";
import { withRouter } from "../../../stories/decorators";

const data = healthFor("wf-openhie", "7");

const meta: Meta<typeof OutcomesDonut> = {
  title: "Projects/Health/HealthDonuts",
  component: OutcomesDonut,
  decorators: [withRouter, (Story) => <div className="w-96 bg-white p-6"><Story /></div>],
  args: { counts: data.counts, emptyMessage: "No finished work orders in the last 7 days", historyHref: "/" },
};
export default meta;
type Story = StoryObj<typeof OutcomesDonut>;

export const Outcomes: Story = {};
export const AllSuccess: Story = { args: { counts: { ...data.counts, failed: 0, crashed: 0, rejected: 0, cancelled: 0 } } };
export const FailureBreakdown: Story = { render: (args) => <FailureBreakdownDonut {...args} /> };
export const Empty: Story = { args: { counts: healthFor("none", "7").counts } };
