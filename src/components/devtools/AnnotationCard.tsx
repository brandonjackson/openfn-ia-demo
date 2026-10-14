import type { Annotation, InventoryRow } from "../../annotations/source";
import { cn } from "../../utils/cn";
import Pill, { type PillColor } from "../Pill";
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
        <button
          key={id}
          type="button"
          onClick={() => onOpenId?.(id)}
          className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-[11px] text-gray-700 hover:bg-primary-50 hover:text-primary-700"
        >
          {id}
        </button>
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
          <h2 className="text-base font-semibold text-gray-900">{title}</h2>
          {annotation && (
            <a
              href={annotation.url}
              target="_blank"
              rel="noreferrer"
              title="Open on GitHub"
              className="shrink-0 text-gray-400 hover:text-gray-600"
            >
              <span className="hero-arrow-top-right-on-square h-4 w-4" />
            </a>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <code className="rounded bg-gray-100 px-1.5 py-0.5 text-[11px] text-gray-700">{id}</code>
          {annotation && <Pill color="indigo">{annotation.folder.replace(/s$/, "")}</Pill>}
          {status && <Pill color={statusColor(status)}>{status}</Pill>}
          {inventory && (
            <Pill color={statusColor(inventory.status)}>
              inventory: {inventory.status}
            </Pill>
          )}
        </div>
        {inventory && (
          <p className="text-xs text-gray-500">
            {inventory.section} · <code className="text-[11px]">{inventory.route.replace(/`/g, "")}</code>
          </p>
        )}
        <IdList label="Inherits" ids={list("inherits")} onOpenId={onOpenId} />
        <IdList label="Flows" ids={list("flows")} onOpenId={onOpenId} />
      </div>

      {!annotation && (
        <div className="rounded-lg border-2 border-dashed border-gray-300 p-4 text-center">
          <span className="hero-document-magnifying-glass mx-auto h-10 w-10 text-gray-400" />
          <p className="mt-2 text-sm font-medium text-gray-700">Not annotated yet</p>
          <p className="mt-1 text-xs text-gray-500">
            {inventory
              ? "This view is in the inventory but its annotation hasn't been written."
              : "No annotation file and no inventory row for this id."}
          </p>
          {inventoryHref && (
            <a href={inventoryHref} target="_blank" rel="noreferrer" className="mt-2 inline-block text-xs text-primary-600 hover:underline">
              Open INVENTORY.md
            </a>
          )}
        </div>
      )}

      {annotation && (
        <>
          {annotation.frontMatterRaw && (
            <details className="group rounded-md border border-gray-200 bg-gray-50">
              <summary className="cursor-pointer select-none px-3 py-2 text-xs font-medium text-gray-600">
                Front matter
              </summary>
              <pre className={cn("overflow-x-auto border-t border-gray-200 px-3 py-2 text-[11px] leading-relaxed text-gray-700")}>
                {annotation.frontMatterRaw}
              </pre>
            </details>
          )}
          <Markdown source={annotation.body} />
        </>
      )}
    </div>
  );
}
