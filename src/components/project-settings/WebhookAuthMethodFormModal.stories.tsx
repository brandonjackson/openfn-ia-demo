import type { Meta, StoryObj } from "@storybook/react";
import WebhookAuthMethodFormModal from "./WebhookAuthMethodFormModal";
import { webhookAuthMethods } from "../../mock-data/project-settings";

const meta: Meta<typeof WebhookAuthMethodFormModal> = {
  title: "Project settings/WebhookAuthMethodFormModal",
  component: WebhookAuthMethodFormModal,
  args: { onCancel: () => {}, onSave: () => {} },
};
export default meta;
type Story = StoryObj<typeof WebhookAuthMethodFormModal>;

export const ChooseType: Story = {};
export const ViewBasic: Story = { args: { authMethod: webhookAuthMethods[0] } };
export const ViewApiKey: Story = { args: { authMethod: webhookAuthMethods[1] } };
