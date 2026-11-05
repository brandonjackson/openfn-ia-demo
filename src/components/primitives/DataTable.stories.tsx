import type { Meta, StoryObj } from "@storybook/react";
import DataTable from "./DataTable";
import type { DataTableColumn } from "./DataTable";
import EnvironmentBadge from "../domain/EnvironmentBadge";
import { Trash2 } from "lucide-react";
import Button from "./Button";
import { userCredentials } from "../../fixtures/user";
import type { UserCredential } from "../../model/page-data";

const columns: DataTableColumn<UserCredential>[] = [
  { key: "name", header: "Name", render: (c) => <span className="font-medium text-gray-900">{c.name}</span> },
  { key: "type", header: "Type", render: (c) => c.schema },
  { key: "projects", header: "Projects", render: (c) => c.projectIds.join(", ") || "None" },
  {
    key: "environment",
    header: "Environment",
    render: (c) => <EnvironmentBadge environment={c.environments[0].environment} />,
  },
  {
    key: "actions",
    header: "",
    align: "right",
    render: () => (
      <Button variant="outline-danger" size="xs" icon={Trash2}>
        Delete
      </Button>
    ),
  },
];

const meta: Meta<typeof DataTable<UserCredential>> = {
  title: "Primitives/DataTable",
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
