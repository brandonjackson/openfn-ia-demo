import type { Meta, StoryObj } from "@storybook/react";
import AdminCollectionTable from "./AdminCollectionTable";
import { instanceCollections } from "../../fixtures/admin";

const meta: Meta<typeof AdminCollectionTable> = {
  title: "Domain/AdminCollectionTable",
  component: AdminCollectionTable,
  parameters: { layout: "padded" },
  args: { collections: instanceCollections, onDelete: () => {} },
};

export default meta;
type Story = StoryObj<typeof AdminCollectionTable>;

export const Default: Story = {};

export const Empty: Story = { args: { collections: [] } };
