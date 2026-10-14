import type { Meta, StoryObj } from "@storybook/react";
import WebhookAuthMethodDeleteModal from "./WebhookAuthMethodDeleteModal";
import { webhookAuthMethods } from "../../mock-data/project-settings";
import { withRouter } from "../../stories/decorators";

const meta: Meta<typeof WebhookAuthMethodDeleteModal> = {
  title: "Project settings/WebhookAuthMethodDeleteModal",
  component: WebhookAuthMethodDeleteModal,
  decorators: [withRouter],
  args: {
    projectId: webhookAuthMethods[0].projectId,
    authMethod: webhookAuthMethods[0],
    onCancel: () => {},
    onDelete: () => {},
  },
};
export default meta;
type Story = StoryObj<typeof WebhookAuthMethodDeleteModal>;

export const UsedByTrigger: Story = {};
export const UsedByChannel: Story = { args: { authMethod: webhookAuthMethods[1] } };
export const Unused: Story = { args: { authMethod: webhookAuthMethods[2] } };
