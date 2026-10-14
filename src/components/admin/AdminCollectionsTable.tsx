import { useState } from "react";
import { collectionProjectName, type Collection } from "../../mock-data/admin";
import { bytesToHuman } from "../../utils/bytesToHuman";
import Button from "../Button";
import TableAction from "../TableAction";
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
      <div className="mt-5 flex justify-between mb-3">
        <h3 className="text-3xl font-bold">
          Collections <span className="text-base font-normal">({collections.length})</span>
        </h3>
        <div>
          <Button id="open-create-collection-modal-button" onClick={onCreate} className="col-span-1 w-full">
            Create collection
          </Button>
        </div>
      </div>
      <div>
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
              <Td className="wrap-break-word max-w-[15rem] text-gray-800">{collection.name}</Td>
              <Td className="wrap-break-word max-w-[25rem]">{collectionProjectName(collection)}</Td>
              <Td className="wrap-break-word max-w-[25rem]">{bytesToHuman(collection.byteSizeSum)}</Td>
              <Td>
                <div className="text-right">
                  <TableAction onClick={() => onEdit(collection)}>Edit</TableAction>
                  <TableAction onClick={() => onDelete(collection)}>Delete</TableAction>
                </div>
              </Td>
            </Tr>
          ))}
        </Table>
      </div>
    </>
  );
}
