import type { Meta, StoryObj } from "@storybook/react";
import CollectionDeleteModal from "./CollectionDeleteModal";
import { collections } from "../../mock-data/project-settings";

const meta: Meta<typeof CollectionDeleteModal> = {
  title: "Project settings/CollectionDeleteModal",
  component: CollectionDeleteModal,
  args: { collection: collections[0], onCancel: () => {}, onDelete: () => {} },
};
export default meta;
type Story = StoryObj<typeof CollectionDeleteModal>;

export const Default: Story = {};
