import type { Meta, StoryObj } from "@storybook/react";
import ChannelRow from "./ChannelRow";
import { withRouter } from "../stories/decorators";
import { serviceCatalogData } from "../mock-data/service-catalog";
import type { ChannelCatalogEntry } from "../page-data";

const channels = serviceCatalogData.entries.filter(
  (e): e is ChannelCatalogEntry => e.kind === "channel"
);
const byType = (t: ChannelCatalogEntry["channelType"]) => channels.find((c) => c.channelType === t)!;
const toArgs = (c: ChannelCatalogEntry) => ({
  id: c.id,
  name: c.name,
  description: c.description,
  channelType: c.channelType,
  system: { name: c.system, path: c.systemPath },
});

const meta: Meta<typeof ChannelRow> = {
  title: "Components/ChannelRow",
  component: ChannelRow,
  decorators: [withRouter],
  parameters: { layout: "padded" },
};

export default meta;
type Story = StoryObj<typeof ChannelRow>;

export const Write: Story = { args: toArgs(byType("write")) };

export const Read: Story = { args: toArgs(byType("read")) };

export const Event: Story = {
  name: "Event (start a workflow)",
  args: toArgs(byType("event")),
};

export const DefaultHttp: Story = {
  name: "Default HTTP channel",
  args: {
    id: "default-http",
    name: "HTTP",
    description: "Default channel created when the URL was added.",
    channelType: "default",
    autoCreated: true,
  },
};
