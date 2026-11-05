import type { Meta, StoryObj } from "@storybook/react";
import CollectionList from "./CollectionList";
import { projectCollections } from "../../fixtures/project-settings";

const meta: Meta<typeof CollectionList> = {
  title: "Domain/CollectionList",
  component: CollectionList,
  parameters: { layout: "padded" },
  args: {
    collections: projectCollections("project-a"),
    onPreview: () => {},
    onRename: () => {},
    onDelete: () => {},
    onCreate: () => {},
  },
};

export default meta;
type Story = StoryObj<typeof CollectionList>;

export const Default: Story = {};

/** Members who can't manage collections can still look inside them. */
export const ReadOnly: Story = { args: { onRename: undefined, onDelete: undefined, onCreate: undefined } };

export const Empty: Story = { args: { collections: [] } };
