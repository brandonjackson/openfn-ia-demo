import type { AdminCollectionRow } from "../../types/admin";
import { formatBytes } from "../../utils/format";
import Button from "../Button";
import TableTitle from "../TableTitle";
import { EmptyState, Table, Td, Th, Tr } from "../Table";
import { useTableSort, type SortValue } from "../useTableSort";

const sortMap: Record<"name" | "byte_size_sum", (c: AdminCollectionRow) => SortValue> = {
  name: (c) => c.name,
  byte_size_sum: (c) => c.byteSizeSum,
};

interface Props {
  collections: AdminCollectionRow[];
  onCreate: () => void;
  onEdit: (collection: AdminCollectionRow) => void;
  onDelete: (collection: AdminCollectionRow) => void;
}

/**
 * The instance-wide collections table (collection_live/components.ex
 * `collections_table`): a "Collections (n)" title with "Create collection",
 * then name / project / used storage with Edit and Delete per row. With no
 * collections it's the dashed "Create a new one." box.
 */
export default function AdminCollectionsTable({ collections, onCreate, onEdit, onDelete }: Props) {
  const { rows, thProps } = useTableSort({ rows: collections, sortMap, initialKey: "name" });

  if (collections.length === 0) {
    return (
      <EmptyState
        icon="hero-plus-circle"
        message="No collection found."
        buttonText="Create a new one."
        onClick={onCreate}
      />
    );
  }

  return (
    <>
      <TableTitle title="Collections" count={collections.length} className="mt-5">
        <Button id="open-create-collection-modal-button" onClick={onCreate}>
          Create collection
        </Button>
      </TableTitle>
      <Table
        id="collections-table"
        header={
          <Tr>
            <Th {...thProps("name")}>Name</Th>
            <Th>Project</Th>
            <Th {...thProps("byte_size_sum")}>Used storage</Th>
            <Th actions />
          </Tr>
        }
      >
        {rows.map((collection) => (
          <Tr key={collection.id} id={`collections-table-row-${collection.id}`}>
            <Td className="max-w-60 wrap-break-word text-gray-800">{collection.name}</Td>
            <Td className="max-w-100 wrap-break-word">{collection.projectName}</Td>
            <Td className="max-w-100 wrap-break-word">{formatBytes(collection.byteSizeSum)}</Td>
            <Td actions>
              <Button theme="secondary" size="xs" onClick={() => onEdit(collection)}>
                Edit
              </Button>
              <Button theme="secondary" size="xs" onClick={() => onDelete(collection)}>
                Delete
              </Button>
            </Td>
          </Tr>
        ))}
      </Table>
    </>
  );
}
