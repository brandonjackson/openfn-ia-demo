import type { Meta, StoryObj } from "@storybook/react";
import ProxyUrlCopy from "./ProxyUrlCopy";
import { channels } from "../../../mock-data/channels";

const meta: Meta<typeof ProxyUrlCopy> = {
  title: "Projects/Channels/ProxyUrlCopy",
  component: ProxyUrlCopy,
  args: { channelId: channels[0].id },
};
export default meta;
type Story = StoryObj<typeof ProxyUrlCopy>;

export const Default: Story = {};
export const Truncated: Story = { args: { icon: true, className: "max-w-64" } };
