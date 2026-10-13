import type { Meta, StoryObj } from "@storybook/react";
import DataTable from "./DataTable";
import type { DataTableColumn } from "./DataTable";
import EnvironmentBadge from "./EnvironmentBadge";
import Button from "./Button";
import { userCredentials } from "../mock-data/user";
import type { UserCredential } from "../page-data";

const columns: DataTableColumn<UserCredential>[] = [
  { key: "name", header: "Name", render: (c) => <span className="font-medium text-gray-900">{c.name}</span> },
  { key: "type", header: "Type", render: (c) => c.type },
  { key: "projects", header: "Projects", render: (c) => c.projects.join(", ") || "—" },
  {
    key: "environment",
    header: "Environment",
    render: (c) => <EnvironmentBadge environment={c.environment} />,
  },
  {
    key: "actions",
    header: "",
    align: "right",
    render: () => <Button variant="link-danger">Delete</Button>,
  },
];

const meta: Meta<typeof DataTable<UserCredential>> = {
  title: "Components/DataTable",
  component: DataTable,
  parameters: { layout: "padded" },
};

export default meta;
type Story = StoryObj<typeof DataTable<UserCredential>>;

export const Default: Story = {
  args: { columns, rows: userCredentials, getRowKey: (c) => c.id },
};

export const Empty: Story = {
  args: { columns, rows: [], getRowKey: (c) => c.id, emptyMessage: "You have no credentials yet." },
};
