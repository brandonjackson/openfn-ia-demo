import type { Meta, StoryObj } from "@storybook/react";
import { withRouter } from "../../stories/decorators";
import { channelRequests } from "../../mock-data/channel-requests";
import { channels } from "../../mock-data/channels";
import ChannelRequestsTable from "./ChannelRequestsTable";

const meta = {
  title: "History/ChannelRequestsTable",
  component: ChannelRequestsTable,
  decorators: [withRouter],
} satisfies Meta<typeof ChannelRequestsTable>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: { requests: channelRequests, channels, projectId: "p" } };
export const Empty: Story = { args: { requests: [], channels, projectId: "p" } };
