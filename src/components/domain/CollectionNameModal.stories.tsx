import type { Meta, StoryObj } from "@storybook/react";
import CollectionNameModal from "./CollectionNameModal";
import { projectCollections } from "../../fixtures/project-settings";

const names = projectCollections("project-a").map((c) => c.name);

const meta: Meta<typeof CollectionNameModal> = {
  title: "Domain/CollectionNameModal",
  component: CollectionNameModal,
  parameters: { layout: "fullscreen" },
  args: { open: true, takenNames: names, onClose: () => {}, onSave: async () => {} },
};

export default meta;
type Story = StoryObj<typeof CollectionNameModal>;

export const Create: Story = {};

export const Rename: Story = {
  args: { currentName: names[0], takenNames: names.slice(1) },
};
