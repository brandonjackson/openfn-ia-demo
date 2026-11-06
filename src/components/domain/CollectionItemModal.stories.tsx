import type { Meta, StoryObj } from "@storybook/react";
import CollectionItemModal from "./CollectionItemModal";
import { componentCollectionItems } from "../../fixtures/project-components";

const items = componentCollectionItems["planning-authority-codes"]!;

const meta: Meta<typeof CollectionItemModal> = {
  title: "Domain/CollectionItemModal",
  component: CollectionItemModal,
  parameters: { layout: "fullscreen" },
  args: { open: true, takenKeys: items.map((i) => i.key), onClose: () => {}, onSave: async () => {} },
};

export default meta;
type Story = StoryObj<typeof CollectionItemModal>;

/** Adding a key. */
export const Add: Story = {};

/** Changing a key's value. */
export const Edit: Story = { args: { item: items[0] } };
