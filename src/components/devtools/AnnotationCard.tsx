import type { Annotation, InventoryRow } from "../../annotations/source";
import Button from "../Button";
import Card from "../Card";
import Heading from "../Heading";
import Pill, { type PillColor } from "../Pill";
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
            <a
              href={annotation.url}
              target="_blank"
              rel="noreferrer"
              title="Open on GitHub"
              className="text-gray-400 hover:text-gray-600"
            >
              <span className="hero-arrow-top-right-on-square h-4 w-4" aria-hidden="true" />
            </a>
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
        <Card dashed className="space-y-1 text-center text-xs text-gray-500">
          <span className="hero-document-magnifying-glass h-10 w-10 text-gray-400" />
          <Heading as="p" size="sm">
            Not annotated yet
          </Heading>
          <p>
            {inventory
              ? "This view is in the inventory but its annotation hasn't been written."
              : "No annotation file and no inventory row for this id."}
          </p>
          {inventoryHref && (
            <TextLink href={inventoryHref} external>
              Open INVENTORY.md
            </TextLink>
          )}
        </Card>
      )}

      {annotation && (
        <>
          {annotation.frontMatterRaw && (
            <Card muted padding="none" className="text-xs text-gray-600">
              <details>
                <summary className="cursor-pointer px-3 py-2 font-medium">Front matter</summary>
                <pre className="overflow-x-auto border-t border-gray-200 px-3 py-2">{annotation.frontMatterRaw}</pre>
              </details>
            </Card>
          )}
          <Markdown source={annotation.body} />
        </>
      )}
    </div>
  );
}
