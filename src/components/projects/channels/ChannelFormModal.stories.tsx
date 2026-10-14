import type { Meta, StoryObj } from "@storybook/react";
import ChannelFormModal from "./ChannelFormModal";
import { channels } from "../../../mock-data/channels";
import { projects } from "../../../mock-data/projects";
import { withRouter } from "../../../stories/decorators";

const meta: Meta<typeof ChannelFormModal> = {
  title: "Projects/Channels/ChannelFormModal",
  component: ChannelFormModal,
  decorators: [withRouter],
  args: { projectId: projects[0].id, onClose: () => {} },
};
export default meta;
type Story = StoryObj<typeof ChannelFormModal>;

export const New: Story = {};
export const Edit: Story = { args: { channel: channels[0] } };
