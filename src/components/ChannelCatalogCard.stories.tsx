import type { Meta, StoryObj } from "@storybook/react";
import ChannelCatalogCard from "./ChannelCatalogCard";
import { withRouter } from "../stories/decorators";
import { serviceCatalogData } from "../mock-data/service-catalog";
import type { CatalogEntry, ChannelCatalogEntry } from "../page-data";

const channels = serviceCatalogData.entries.filter(
  (e: CatalogEntry): e is ChannelCatalogEntry => e.kind === "channel"
);
const ofType = (t: ChannelCatalogEntry["channelType"]) => channels.find((c) => c.channelType === t)!;

const meta: Meta<typeof ChannelCatalogCard> = {
  title: "Components/ChannelCatalogCard",
  component: ChannelCatalogCard,
  decorators: [withRouter],
  parameters: { layout: "padded" },
};

export default meta;
type Story = StoryObj<typeof ChannelCatalogCard>;

export const Write: Story = { args: { entry: ofType("write") } };

export const Read: Story = { args: { entry: ofType("read") } };

/** Event channels offer to start a new workflow from them. */
export const Event: Story = { args: { entry: ofType("event") } };
