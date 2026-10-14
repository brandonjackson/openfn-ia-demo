import type { Meta, StoryObj } from "@storybook/react";
import ChannelsTable from "./ChannelsTable";
import { channelsIn } from "../../../mock-data/channels";
import { projects } from "../../../mock-data/projects";
import { withRouter } from "../../../stories/decorators";

const meta: Meta<typeof ChannelsTable> = {
  title: "Projects/Channels/ChannelsTable",
  component: ChannelsTable,
  decorators: [withRouter],
  args: { channels: channelsIn(projects[0].id), projectId: projects[0].id },
};
export default meta;
type Story = StoryObj<typeof ChannelsTable>;

export const Default: Story = {};
export const ReadOnly: Story = { args: { canEdit: false, canDelete: false } };
export const Empty: Story = { args: { channels: [] } };
