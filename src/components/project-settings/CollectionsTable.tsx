import { useState } from "react";
import { EmptyState, Table, Td, Th, Tr } from "../Table";
import Button from "../Button";
import type { Collection } from "../../mock-data/project-settings";
import { formatBytes } from "../../utils/format";

interface Props {
  collections: Collection[];
  canCreateCollection: boolean;
  onCreate: () => void;
  onPreview: (c: Collection) => void;
  onEdit: (c: Collection) => void;
  onDelete: (c: Collection) => void;
}

type SortKey = "name" | "byteSizeSum";

/**
 * Lightning's `DataTables.collections_table` (live/components/data_tables.ex)
 * with the actions from collections_component.ex: preview, Download, Edit,
 * Delete. Name and Used storage sort client-side.
 */
export default function CollectionsTable({ collections, canCreateCollection, onCreate, onPreview, onEdit, onDelete }: Props) {
  const [sortBy, setSortBy] = useState<SortKey>("name");
  const [dir, setDir] = useState<"asc" | "desc">("asc");

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

  const sorted = [...collections].sort((a, b) => {
    const cmp = sortBy === "name" ? a.name.localeCompare(b.name) : a.byteSizeSum - b.byteSizeSum;
    return dir === "asc" ? cmp : -cmp;
  });
  const sort = (key: SortKey) => {
    if (key === sortBy) setDir(dir === "asc" ? "desc" : "asc");
    else {
      setSortBy(key);
      setDir("asc");
    }
  };

  return (
    <Table
      id="collections-table"
      header={
        <Tr>
          <Th sortDirection={sortBy === "name" ? dir : null} onSort={() => sort("name")}>
            Name
          </Th>
          <Th sortDirection={sortBy === "byteSizeSum" ? dir : null} onSort={() => sort("byteSizeSum")}>
            Used storage
          </Th>
          <Th>
            <span className="sr-only">Actions</span>
          </Th>
        </Tr>
      }
    >
      {sorted.map((c) => (
        <Tr key={c.id} id={`collection-row-${c.id}`}>
          <Td>{c.name}</Td>
          <Td>{formatBytes(c.byteSizeSum)}</Td>
          <Td className="text-right">
            <div className="inline-flex gap-1">
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
            </div>
          </Td>
        </Tr>
      ))}
    </Table>
  );
}
