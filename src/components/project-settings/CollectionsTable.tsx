import { EmptyState, Table, Td, Th, Tr } from "../Table";
import { useTableSort, type SortValue } from "../useTableSort";
import Button from "../Button";
import type { Collection } from "../../types/project-settings";
import { formatBytes } from "../../utils/format";

interface Props {
  collections: Collection[];
  canCreateCollection: boolean;
  onCreate: () => void;
  onPreview: (c: Collection) => void;
  onEdit: (c: Collection) => void;
  onDelete: (c: Collection) => void;
}

const sortMap: Record<"name" | "byteSizeSum", (c: Collection) => SortValue> = {
  name: (c) => c.name,
  byteSizeSum: (c) => c.byteSizeSum,
};

/**
 * Lightning's `DataTables.collections_table` (live/components/data_tables.ex)
 * with the actions from collections_component.ex: preview, Download, Edit,
 * Delete. Name and Used storage sort client-side.
 */
export default function CollectionsTable({ collections, canCreateCollection, onCreate, onPreview, onEdit, onDelete }: Props) {
  const { rows, thProps } = useTableSort({ rows: collections, sortMap, initialKey: "name" });

  if (collections.length === 0) {
    return (
      <EmptyState
        icon="hero-plus-circle"
        message="No collections found."
        buttonText="Create a new collection"
        onClick={onCreate}
        disabled={!canCreateCollection}
      />
    );
  }

  return (
    <Table
      id="collections-table"
      header={
        <Tr>
          <Th {...thProps("name")}>Name</Th>
          <Th {...thProps("byteSizeSum")}>Used storage</Th>
          <Th actions />
        </Tr>
      }
    >
      {rows.map((c) => (
        <Tr key={c.id} id={`collection-row-${c.id}`}>
          <Td>{c.name}</Td>
          <Td>{formatBytes(c.byteSizeSum)}</Td>
          <Td actions>
            <Button theme="secondary" size="xs" onClick={() => onPreview(c)}>
              <span className="hero-eye h-4 w-4" aria-hidden="true" />
              <span className="sr-only">Preview collection</span>
            </Button>
            <Button theme="secondary" size="xs">Download</Button>
            <Button theme="secondary" size="xs" disabled={!canCreateCollection} onClick={() => onEdit(c)}>
              Edit
            </Button>
            <Button theme="secondary" size="xs" disabled={!canCreateCollection} onClick={() => onDelete(c)}>
              Delete
            </Button>
          </Td>
        </Tr>
      ))}
    </Table>
  );
}
