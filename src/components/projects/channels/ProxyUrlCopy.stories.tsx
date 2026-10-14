import type { Meta, StoryObj } from "@storybook/react";
import ProxyUrlCopy from "./ProxyUrlCopy";
import { channels } from "../../../mock-data/channels";

const meta: Meta<typeof ProxyUrlCopy> = {
  title: "Projects/Channels/ProxyUrlCopy",
  component: ProxyUrlCopy,
  args: { channelId: channels[0].id, textClassName: "text-gray-500" },
};
export default meta;
type Story = StoryObj<typeof ProxyUrlCopy>;

export const Default: Story = {};
export const Truncated: Story = {
  args: { textClassName: "text-gray-400 max-w-[16rem]", leading: <span className="hero-link h-4 w-4 text-gray-300" /> },
};
