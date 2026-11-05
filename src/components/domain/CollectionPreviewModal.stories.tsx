import type { Meta, StoryObj } from "@storybook/react";
import CollectionPreviewModal from "./CollectionPreviewModal";
import { collectionItems, projectCollections } from "../../fixtures/project-settings";

const [cache] = projectCollections("project-a");

const meta: Meta<typeof CollectionPreviewModal> = {
  title: "Domain/CollectionPreviewModal",
  component: CollectionPreviewModal,
  parameters: { layout: "fullscreen" },
  args: { collection: cache, items: collectionItems[cache.id], onClose: () => {} },
};

export default meta;
type Story = StoryObj<typeof CollectionPreviewModal>;

export const Default: Story = {};

export const Loading: Story = { args: { items: undefined } };

export const Empty: Story = { args: { collection: { ...cache, itemCount: 0 }, items: [] } };
