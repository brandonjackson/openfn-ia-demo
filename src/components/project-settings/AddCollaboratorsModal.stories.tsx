import type { Meta, StoryObj } from "@storybook/react";
import AddCollaboratorsModal from "./AddCollaboratorsModal";

const meta: Meta<typeof AddCollaboratorsModal> = {
  title: "Project settings/AddCollaboratorsModal",
  component: AddCollaboratorsModal,
  args: { existingEmails: ["demo@openfn.org"], onCancel: () => {}, onSave: () => {} },
};
export default meta;
type Story = StoryObj<typeof AddCollaboratorsModal>;

export const Default: Story = {};
