import { useState } from "react";
import { Database, Pencil, Plus, Trash2 } from "lucide-react";
import type { CollectionItem } from "../../model/collections";
import { formatBytes } from "../../model/project-settings";
import Badge from "../primitives/Badge";
import Button from "../primitives/Button";
import Card from "../primitives/Card";
import ConfirmModal from "../primitives/ConfirmModal";
import DataTable, { type DataTableColumn } from "../primitives/DataTable";
import EmptyState from "../primitives/EmptyState";
import IconButton from "../primitives/IconButton";
import Inline from "../primitives/Inline";
import ScrollPane from "../primitives/ScrollPane";
import SearchInput from "../primitives/SearchInput";
import SectionHeading from "../primitives/SectionHeading";
import Stack from "../primitives/Stack";
import StatTile from "../primitives/StatTile";
import Grid from "../primitives/Grid";
import Text from "../primitives/Text";
import CollectionItemModal from "./CollectionItemModal";

interface Props {
  /** Shown as the heading in a pane; a page has its own header. */
  name: string;
  /** Its keys, newest first. */
  items: CollectionItem[];
  /** How many keys it holds in all, which can be more than are listed. */
  itemCount: number;
  /** Their size, in bytes. */
  byteSize: number;
  variant?: "pane" | "page";
  /** Writes a key's value, adding the key if it's new. Left out where you can't write to it. */
  onSaveItem?: (key: string, value: string) => Promise<void>;
  /** Deletes a key. Left out where you can't. */
  onDeleteItem?: (key: string) => Promise<void>;
}

/** The first line of a value, short enough for a table cell. */
const preview = (value: string) => {
  const flat = value.replace(/\s+/g, " ").trim();
  return flat.length > 90 ? `${flat.slice(0, 90)}…` : flat;
};

/**
 * A collection: the keys and values it holds, which workflows read and write
 * between runs. Search by key, add a key, change a value or delete a key.
 * The same view in two places, as `ChannelView` is: the project's page for
 * the collection ("page") and the workflow editor's code view ("pane").
 */
export default function CollectionView({ name, items, itemCount, byteSize, variant = "pane", onSaveItem, onDeleteItem }: Props) {
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<CollectionItem | "new">();
  const [deleting, setDeleting] = useState<string>();
  const shown = items.filter((i) => i.key.toLowerCase().includes(query.trim().toLowerCase()));
  const hidden = itemCount - items.length;

  const columns: DataTableColumn<CollectionItem>[] = [
    { key: "key", header: "Key", render: (i) => <Text tone="strong" mono nowrap>{i.key}</Text> },
    { key: "value", header: "Value", render: (i) => <Text mono size="xs">{preview(i.value)}</Text> },
    { key: "updated", header: "Updated", render: (i) => <Text tone="muted" size="xs" nowrap>{i.updatedAt}</Text> },
    ...(onSaveItem || onDeleteItem
      ? [
          {
            key: "actions",
            header: "",
            align: "right" as const,
            render: (i: CollectionItem) => (
              <Inline gap="xs" justify="end">
                {onSaveItem && <IconButton icon={Pencil} label={`Edit ${i.key}`} size="sm" onClick={() => setEditing(i)} />}
                {onDeleteItem && <IconButton icon={Trash2} label={`Delete ${i.key}`} size="sm" onClick={() => setDeleting(i.key)} />}
              </Inline>
            ),
          },
        ]
      : []),
  ];

  const body = (
    <Stack gap="lg">
      {variant === "pane" && (
        <SectionHeading title={name} description="Keys and values your workflows read and write between runs." action={<Badge label="Collection" icon={Database} shape="tag" />} />
      )}
      <Grid columns={2}>
        <StatTile label="Keys" value={itemCount.toLocaleString("en-GB")} />
        <StatTile label="Size" value={formatBytes(byteSize)} />
      </Grid>
      <Card
        title="Keys"
        description={hidden > 0 ? `The ${items.length.toLocaleString("en-GB")} most recently written of ${itemCount.toLocaleString("en-GB")}.` : "Newest first."}
        actions={
          onSaveItem && (
            <Button size="sm" icon={Plus} onClick={() => setEditing("new")}>
              Add key
            </Button>
          )
        }
      >
        {items.length === 0 ? (
          <EmptyState
            icon={Database}
            title="This collection is empty"
            description="Workflows add keys as they run, with collections.set(). You can add one by hand too."
          />
        ) : (
          <Stack gap="md">
            <SearchInput placeholder="Search keys" aria-label="Search keys" value={query} onChange={(e) => setQuery(e.target.value)} compact />
            <DataTable columns={columns} rows={shown} getRowKey={(i) => i.key} emptyMessage="No keys match." />
          </Stack>
        )}
      </Card>

      {onSaveItem && (
        <CollectionItemModal
          open={editing !== undefined}
          item={editing === "new" ? undefined : editing}
          takenKeys={items.map((i) => i.key)}
          onClose={() => setEditing(undefined)}
          onSave={onSaveItem}
        />
      )}
      {onDeleteItem && (
        <ConfirmModal
          open={deleting !== undefined}
          title={`Delete ${deleting}?`}
          confirmLabel="Delete key"
          onClose={() => setDeleting(undefined)}
          onConfirm={() => {
            const key = deleting!;
            setDeleting(undefined);
            void onDeleteItem(key);
          }}
        >
          Workflows that read this key will get nothing back until it's written again.
        </ConfirmModal>
      )}
    </Stack>
  );
  return variant === "pane" ? <ScrollPane>{body}</ScrollPane> : body;
}
