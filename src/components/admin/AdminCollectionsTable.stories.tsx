import type { Meta, StoryObj } from "@storybook/react";
import AdminCollectionsTable from "./AdminCollectionsTable";
import { adminCollectionRows } from "../../mock-data/admin";

const collections = adminCollectionRows();

const meta: Meta<typeof AdminCollectionsTable> = {
  title: "Admin/AdminCollectionsTable",
  component: AdminCollectionsTable,
  args: { collections, onCreate: () => {}, onEdit: () => {}, onDelete: () => {} },
};
export default meta;
type Story = StoryObj<typeof AdminCollectionsTable>;

export const Default: Story = {};
export const Empty: Story = { args: { collections: [] } };
