import type { Meta, StoryObj } from "@storybook/react";
import AdminCollectionModal from "./AdminCollectionModal";
import { collections } from "../../mock-data/admin";

const meta: Meta<typeof AdminCollectionModal> = {
  title: "Admin/AdminCollectionModal",
  component: AdminCollectionModal,
  args: { onCancel: () => {}, onSave: () => {} },
};
export default meta;
type Story = StoryObj<typeof AdminCollectionModal>;

export const Create: Story = {};
export const Edit: Story = { args: { collection: collections[0] } };
