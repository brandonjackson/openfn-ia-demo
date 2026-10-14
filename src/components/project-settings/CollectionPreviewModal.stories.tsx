import type { Meta, StoryObj } from "@storybook/react";
import CollectionPreviewModal from "./CollectionPreviewModal";
import { collections } from "../../mock-data/project-settings";

const meta: Meta<typeof CollectionPreviewModal> = {
  title: "Project settings/CollectionPreviewModal",
  component: CollectionPreviewModal,
  args: { collection: collections[0], onClose: () => {} },
};
export default meta;
type Story = StoryObj<typeof CollectionPreviewModal>;

export const WithRecord: Story = {};
export const Empty: Story = { args: { collection: collections[2] } };
