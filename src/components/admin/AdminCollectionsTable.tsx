import { useState } from "react";
import { collectionProjectName, type Collection } from "../../mock-data/admin";
import { formatBytes } from "../../utils/format";
import Button from "../Button";
import Heading from "../Heading";
import { EmptyState, Table, Td, Th, Tr } from "../Table";

type SortKey = "name" | "byte_size_sum";

interface Props {
  collections: Collection[];
  onCreate: () => void;
  onEdit: (collection: Collection) => void;
  onDelete: (collection: Collection) => void;
}

/**
 * The instance-wide collections table (collection_live/components.ex
 * `collections_table`): a "Collections (n)" title with "Create collection",
 * then name / project / used storage with Edit and Delete per row. With no
 * collections it's the dashed "Create a new one." box.
 */
export default function AdminCollectionsTable({ collections, onCreate, onEdit, onDelete }: Props) {
  const [sortBy, setSortBy] = useState<SortKey>("name");
  const [direction, setDirection] = useState<"asc" | "desc">("asc");

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

  const sorted = [...collections].sort((a, b) => {
    const cmp = sortBy === "name" ? a.name.localeCompare(b.name) : a.byteSizeSum - b.byteSizeSum;
    return direction === "asc" ? cmp : -cmp;
  });
  const sort = (key: SortKey) => {
    setDirection(key === sortBy && direction === "asc" ? "desc" : "asc");
    setSortBy(key);
  };
  const thSort = (key: SortKey) => ({ sortDirection: sortBy === key ? direction : null, onSort: () => sort(key) });

  return (
    <>
      <div className="mb-3 mt-5 flex justify-between">
        <Heading size="xl">
          Collections <span className="text-base font-normal">({collections.length})</span>
        </Heading>
        <Button id="open-create-collection-modal-button" onClick={onCreate}>
          Create collection
        </Button>
      </div>
      <Table
        id="collections-table"
        header={
          <Tr>
            <Th {...thSort("name")}>Name</Th>
            <Th>Project</Th>
            <Th {...thSort("byte_size_sum")}>Used storage</Th>
            <Th />
          </Tr>
        }
        >
        {sorted.map((collection) => (
          <Tr key={collection.id} id={`collections-table-row-${collection.id}`}>
            <Td className="max-w-60 wrap-break-word text-gray-800">{collection.name}</Td>
            <Td className="max-w-100 wrap-break-word">{collectionProjectName(collection)}</Td>
            <Td className="max-w-100 wrap-break-word">{formatBytes(collection.byteSizeSum)}</Td>
            <Td className="text-right">
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
