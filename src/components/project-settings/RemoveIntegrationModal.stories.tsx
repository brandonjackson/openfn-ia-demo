import type { Meta, StoryObj } from "@storybook/react";
import RemoveIntegrationModal from "./RemoveIntegrationModal";

const meta: Meta<typeof RemoveIntegrationModal> = {
  title: "Project settings/RemoveIntegrationModal",
  component: RemoveIntegrationModal,
  args: { onCancel: () => {}, onConfirm: () => {} },
};
export default meta;
type Story = StoryObj<typeof RemoveIntegrationModal>;

export const Default: Story = {};
