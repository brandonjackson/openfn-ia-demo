import type { Annotation, InventoryRow } from "../../annotations/source";
import Button from "../Button";
import Disclosure from "../Disclosure";
import Heading from "../Heading";
import IconButton from "../IconButton";
import Pill, { type PillColor } from "../Pill";
import { EmptyState } from "../Table";
import TextLink from "../TextLink";
import Markdown from "./Markdown";

interface Props {
  id: string;
  annotation: Annotation | null;
  inventory?: InventoryRow;
  /** Called with an id from the annotation's `inherits` / `flows` lists. */
  onOpenId?: (id: string) => void;
  inventoryHref?: string;
}

const statusColors: Record<string, PillColor> = {
  "not-started": "gray",
  todo: "gray",
  "in-progress": "yellow",
  migrated: "green",
  done: "green",
  "done-with-decides": "blue",
  cut: "red",
};

function statusColor(status: string): PillColor {
  return statusColors[status] ?? (status.startsWith("batch-") ? "yellow" : "gray");
}

function IdList({ label, ids, onOpenId }: { label: string; ids: string[]; onOpenId?: (id: string) => void }) {
  if (ids.length === 0) return null;
  return (
    <div className="flex flex-wrap items-center gap-1.5 text-xs">
      <span className="text-gray-500">{label}</span>
      {ids.map((id) => (
        <Button key={id} theme="secondary" size="xs" className="font-mono text-xs" onClick={() => onOpenId?.(id)}>
          {id}
        </Button>
      ))}
    </div>
  );
}

/**
 * One behaviour annotation: its title and status, the inventory row it
 * belongs to, the shared annotations it inherits, then the markdown body.
 * Shows where things stand when the file hasn't been written yet.
 */
export default function AnnotationCard({ id, annotation, inventory, onOpenId, inventoryHref }: Props) {
  const fm = annotation?.frontMatter ?? {};
  const title = typeof fm.title === "string" ? fm.title : id;
  const status = typeof fm.status === "string" ? fm.status : null;
  const list = (key: string) => (Array.isArray(fm[key]) ? (fm[key] as string[]) : []);

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-2">
          <Heading as="h2">{title}</Heading>
          {annotation && (
            <IconButton
              href={annotation.url}
              external
              icon="hero-arrow-top-right-on-square"
              label="Open on GitHub"
              size="sm"
            />
          )}
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <Pill square mono>
            {id}
          </Pill>
          {annotation && <Pill color="primary">{annotation.folder.replace(/s$/, "")}</Pill>}
          {status && <Pill color={statusColor(status)}>{status}</Pill>}
          {inventory && <Pill color={statusColor(inventory.status)}>inventory: {inventory.status}</Pill>}
        </div>
        {inventory && (
          <p className="text-xs text-gray-500">
            {inventory.section} · <code>{inventory.route.replace(/`/g, "")}</code>
          </p>
        )}
        <IdList label="Inherits" ids={list("inherits")} onOpenId={onOpenId} />
        <IdList label="Flows" ids={list("flows")} onOpenId={onOpenId} />
      </div>

      {!annotation && (
        <EmptyState
          icon="hero-document-magnifying-glass"
          title="Not annotated yet"
          message={
            inventory
              ? "This view is in the inventory but its annotation hasn't been written."
              : "No annotation file and no inventory row for this id."
          }
        >
          {inventoryHref && (
            <TextLink href={inventoryHref} external>
              Open INVENTORY.md
            </TextLink>
          )}
        </EmptyState>
      )}

      {annotation && (
        <>
          {annotation.frontMatterRaw && (
            <Disclosure title="Front matter" defaultOpen={false} padded={false}>
              <pre className="overflow-x-auto border-t border-gray-200 px-4 py-3 text-xs text-gray-600">{annotation.frontMatterRaw}</pre>
            </Disclosure>
          )}
          <Markdown source={annotation.body} />
        </>
      )}
    </div>
  );
}
