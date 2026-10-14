import type { Meta, StoryObj } from "@storybook/react";
import CollectionsTable from "./CollectionsTable";
import { collections } from "../../mock-data/project-settings";

const noop = () => {};
const meta: Meta<typeof CollectionsTable> = {
  title: "Project settings/CollectionsTable",
  component: CollectionsTable,
  args: {
    collections,
    canCreateCollection: true,
    onCreate: noop,
    onPreview: noop,
    onEdit: noop,
    onDelete: noop,
  },
};
export default meta;
type Story = StoryObj<typeof CollectionsTable>;

export const Default: Story = {};
export const Empty: Story = { args: { collections: [] } };
export const ReadOnly: Story = { args: { canCreateCollection: false } };
