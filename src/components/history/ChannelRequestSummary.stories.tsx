import type { Meta, StoryObj } from "@storybook/react";
import { withRouter } from "../../stories/decorators";
import { channelRequests } from "../../mock-data/channel-requests";
import { findChannel } from "../../mock-data/channels";
import { primaryEvent } from "../../utils/history";
import ChannelRequestSummary from "./ChannelRequestSummary";

const meta = {
  title: "History/ChannelRequestSummary",
  component: ChannelRequestSummary,
  decorators: [withRouter],
} satisfies Meta<typeof ChannelRequestSummary>;
export default meta;
type Story = StoryObj<typeof meta>;

const argsFor = (i: number) => {
  const request = channelRequests[i];
  return { request, event: primaryEvent(request), channel: findChannel(request.channelId)! };
};

export const Success: Story = { args: argsFor(0) };
export const NotFound: Story = { args: argsFor(1) };
export const ConnectionRefused: Story = { args: argsFor(2) };
