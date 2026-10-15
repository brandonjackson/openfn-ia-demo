import type { Meta, StoryObj } from "@storybook/react";
import AdminCollectionModal from "./AdminCollectionModal";
import { collectionProjectOptions } from "../../mock-data/admin";
import { collections } from "../../mock-data/project-settings";

const meta: Meta<typeof AdminCollectionModal> = {
  title: "Admin/AdminCollectionModal",
  component: AdminCollectionModal,
  args: { projectOptions: collectionProjectOptions, onCancel: () => {}, onSave: () => {} },
};
export default meta;
type Story = StoryObj<typeof AdminCollectionModal>;

export const Create: Story = {};
export const Edit: Story = { args: { collection: collections[0] } };
