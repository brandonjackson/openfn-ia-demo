import type { Meta, StoryObj } from "@storybook/react";
import CollectionView from "./CollectionView";
import { componentCollectionItems } from "../../fixtures/project-components";

const items = componentCollectionItems["planning-authority-codes"]!;

const meta: Meta<typeof CollectionView> = {
  title: "Domain/CollectionView",
  component: CollectionView,
  parameters: { layout: "fullscreen" },
  decorators: [
    (Story) => (
      <div style={{ height: 760 }}>
        <Story />
      </div>
    ),
  ],
  args: { name: "planning-authority-codes", items, itemCount: items.length, byteSize: 412, onSaveItem: async () => {}, onDeleteItem: async () => {} },
};

export default meta;
type Story = StoryObj<typeof CollectionView>;

/** As the editor shows it from its explorer: its keys, to search, add, edit and delete. */
export const Default: Story = {};

/** On the collection's page in the project, under the page's own header. */
export const OnPage: Story = { args: { variant: "page" }, parameters: { layout: "padded" } };

/** A big collection: only its most recently written keys are listed. */
export const Partial: Story = { args: { itemCount: 1284, byteSize: 2_480_000 } };

export const Empty: Story = { args: { items: [], itemCount: 0, byteSize: 0 } };

/** For a viewer: the keys to read, and nothing to change. */
export const ReadOnly: Story = { args: { onSaveItem: undefined, onDeleteItem: undefined } };
