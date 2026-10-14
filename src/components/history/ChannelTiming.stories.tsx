import type { Meta, StoryObj } from "@storybook/react";
import { channelRequests } from "../../mock-data/channel-requests";
import ChannelTiming from "./ChannelTiming";

const meta = { title: "History/ChannelTiming", component: ChannelTiming } satisfies Meta<typeof ChannelTiming>;
export default meta;
type Story = StoryObj<typeof meta>;

export const FullPhases: Story = { args: { event: channelRequests[0].events[0] } };
export const TtfbOnly: Story = { args: { event: channelRequests[1].events[0] } };
export const TotalOnly: Story = { args: { event: channelRequests[2].events[0] } };
