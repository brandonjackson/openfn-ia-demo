import type { Meta, StoryObj } from "@storybook/react";
import CollectionFormModal from "./CollectionFormModal";

const meta: Meta<typeof CollectionFormModal> = {
  title: "Project settings/CollectionFormModal",
  component: CollectionFormModal,
  args: { title: "Create Collection", onCancel: () => {}, onSave: () => {} },
};
export default meta;
type Story = StoryObj<typeof CollectionFormModal>;

export const Create: Story = {};
export const Edit: Story = { args: { title: "Edit Collection", initialName: "patient-registrations" } };
