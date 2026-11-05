import { Eye, Pencil, PlusCircle, Trash2 } from "lucide-react";
import type { ProjectCollection } from "../../model/page-data";
import { formatBytes } from "../../model/project-settings";
import DataTable, { type DataTableColumn } from "../primitives/DataTable";
import Button from "../primitives/Button";
import EmptyState from "../primitives/EmptyState";
import Inline from "../primitives/Inline";
import Text from "../primitives/Text";

interface Props {
  collections: ProjectCollection[];
  /** Shows a few of a collection's keys and values. */
  onPreview?: (collection: ProjectCollection) => void;
  /** Renames a collection. Left out when you can't manage collections. */
  onRename?: (collection: ProjectCollection) => void;
  /** Asks to delete a collection. Left out when you can't manage collections. */
  onDelete?: (collection: ProjectCollection) => void;
  /** Starts a new collection from the empty state. Left out when you can't. */
  onCreate?: () => void;
}

/** A project's collections: how many keys each holds, how big it is and when it last changed. */
export default function CollectionList({ collections, onPreview, onRename, onDelete, onCreate }: Props) {
  if (collections.length === 0)
    return (
      <EmptyState
        icon={PlusCircle}
        title="No collections found."
        description="Collections store data between runs, as keys and values your workflows read and write."
        action={onCreate && <Button onClick={onCreate}>Create a new collection</Button>}
      />
    );

  const columns: DataTableColumn<ProjectCollection>[] = [
    {
      key: "name",
      header: "Name",
      render: (c) => (
        <Text tone="strong" mono>
          {c.name}
        </Text>
      ),
    },
    { key: "items", header: "Items", render: (c) => c.itemCount.toLocaleString("en-GB") },
    { key: "size", header: "Size", render: (c) => formatBytes(c.byteSize) },
    { key: "updated", header: "Last updated", render: (c) => c.updatedAt },
    {
      key: "actions",
      header: "",
      align: "right",
      render: (c) => (
        <Inline gap="sm" justify="end">
          {onPreview && (
            <Button variant="secondary" size="xs" icon={Eye} onClick={() => onPreview(c)}>
              Preview
            </Button>
          )}
          {onRename && (
            <Button variant="secondary" size="xs" icon={Pencil} onClick={() => onRename(c)}>
              Rename
            </Button>
          )}
          {onDelete && (
            <Button variant="outline-danger" size="xs" icon={Trash2} onClick={() => onDelete(c)}>
              Delete
            </Button>
          )}
        </Inline>
      ),
    },
  ];
  return <DataTable columns={columns} rows={collections} getRowKey={(c) => c.id} />;
}
