import { Trash2 } from "lucide-react";
import type { AdminCollection } from "../../model/page-data";
import { formatBytes } from "../../model/admin";
import Button from "../primitives/Button";
import DataTable from "../primitives/DataTable";
import type { DataTableColumn } from "../primitives/DataTable";
import Text from "../primitives/Text";

interface Props {
  collections: AdminCollection[];
  /** Asks to delete a collection and everything in it. */
  onDelete: (collection: AdminCollection) => void;
  /** Shown when no collection matches, e.g. a search with no results. */
  emptyMessage?: string;
}

/**
 * Every collection on the instance, across all projects, for a superuser:
 * which project it belongs to, how many items it holds and how much space
 * they take, with a button to delete it.
 */
export default function AdminCollectionTable({ collections, onDelete, emptyMessage = "No collections yet." }: Props) {
  const columns: DataTableColumn<AdminCollection>[] = [
    {
      key: "name",
      header: "Name",
      render: (c) => (
        <Text tone="strong" mono>
          {c.name}
        </Text>
      ),
    },
    { key: "project", header: "Project", render: (c) => <Text>{c.projectName}</Text> },
    { key: "items", header: "Items", align: "right", render: (c) => <Text>{c.items.toLocaleString()}</Text> },
    { key: "size", header: "Size", align: "right", render: (c) => <Text>{formatBytes(c.bytes)}</Text> },
    {
      key: "actions",
      header: "",
      align: "right",
      render: (c) => (
        <Button variant="outline-danger" size="xs" icon={Trash2} onClick={() => onDelete(c)} aria-label={`Delete ${c.name}`}>
          Delete
        </Button>
      ),
    },
  ];
  return <DataTable columns={columns} rows={collections} getRowKey={(c) => c.id} emptyMessage={emptyMessage} />;
}
