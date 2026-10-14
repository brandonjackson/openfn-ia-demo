import type { Meta, StoryObj } from "@storybook/react";
import MetricCard from "./MetricCard";
import TextLink from "../TextLink";

const meta: Meta<typeof MetricCard> = {
  title: "Projects/MetricCard",
  component: MetricCard,
  decorators: [(Story) => <div className="w-72"><Story /></div>],
  args: { title: "Work Orders", value: 1314, suffix: "2 pending" },
};
export default meta;
type Story = StoryObj<typeof MetricCard>;

export const Default: Story = {};
export const WithLink: Story = {
  args: { title: "Work Orders in failed state", value: 26, suffix: "2.0%", link: <TextLink href="#">View all</TextLink> },
};
