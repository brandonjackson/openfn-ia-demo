import type { Meta, StoryObj } from "@storybook/react";
import LinkedUsageModal from "./LinkedUsageModal";
import { webhookAuthMethods } from "../../mock-data/project-settings";
import { withRouter } from "../../stories/decorators";

const meta: Meta<typeof LinkedUsageModal> = {
  title: "Project settings/LinkedUsageModal",
  component: LinkedUsageModal,
  decorators: [withRouter],
  args: { projectId: webhookAuthMethods[0].projectId, authMethod: webhookAuthMethods[0], onClose: () => {} },
};
export default meta;
type Story = StoryObj<typeof LinkedUsageModal>;

export const Triggers: Story = {};
export const Channels: Story = { args: { authMethod: webhookAuthMethods[1] } };
