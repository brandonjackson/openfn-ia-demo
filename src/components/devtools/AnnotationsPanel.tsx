import { useEffect, useState } from "react";
import { useAnnotations } from "../../annotations/annotations-context";
import {
  ANNOTATIONS_BRANCH,
  clearAnnotationCache,
  inventoryUrl,
  loadAnnotation,
  loadInventory,
  type Annotation,
  type InventoryRow,
} from "../../annotations/source";
import { cn } from "../../utils/cn";
import AnnotationCard from "./AnnotationCard";

export const ANNOTATIONS_PANEL_WIDTH = 440;

type Load = { id: string; annotation: Annotation | null; error: string | null };

/**
 * Right-hand panel showing the behaviour annotation for whatever the mouse
 * is over (or the page), read live from the Lightning annotations branch.
 */
export default function AnnotationsPanel() {
  const { open, setOpen, currentId, pageId, pinnedId, pin } = useAnnotations();
  const [loaded, setLoaded] = useState<Load | null>(null);
  const [inventory, setInventory] = useState<Map<string, InventoryRow>>(new Map());
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (!open) return;
    loadInventory().then(setInventory, () => setInventory(new Map()));
  }, [open, refreshKey]);

  useEffect(() => {
    if (!open || !currentId) return;
    let cancelled = false;
    loadAnnotation(currentId).then(
      (annotation) => !cancelled && setLoaded({ id: currentId, annotation, error: null }),
      (e: Error) => !cancelled && setLoaded({ id: currentId, annotation: null, error: e.message })
    );
    return () => {
      cancelled = true;
    };
  }, [open, currentId, refreshKey]);

  if (!open) return null;

  const loading = !!currentId && loaded?.id !== currentId;

  return (
    <aside
      data-devtools
      style={{ width: ANNOTATIONS_PANEL_WIDTH }}
      className="fixed inset-y-0 right-0 z-[9998] flex flex-col border-l border-gray-200 bg-white shadow-xl"
      aria-label="Annotations"
    >
      <div className="flex h-20 flex-none items-center justify-between gap-2 border-b border-gray-200 px-5">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-gray-900">Annotations</p>
          <p className="truncate text-xs text-gray-500" title={ANNOTATIONS_BRANCH}>
            {pinnedId ? "Pinned" : "Following the mouse"} · {ANNOTATIONS_BRANCH}
          </p>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => pin(pinnedId ? null : currentId)}
            title={pinnedId ? "Unpin and follow the mouse" : "Pin this annotation"}
            className={cn(
              "rounded-md p-1.5 hover:bg-gray-100",
              pinnedId ? "text-primary-600" : "text-gray-400 hover:text-gray-600"
            )}
          >
            <span className={cn(pinnedId ? "hero-lock-closed" : "hero-lock-open", "h-5 w-5")} />
          </button>
          <button
            type="button"
            onClick={() => {
              clearAnnotationCache();
              setRefreshKey((k) => k + 1);
            }}
            title="Reload from GitHub"
            className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <span className="hero-arrow-path h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => setOpen(false)}
            title="Close"
            className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <span className="hero-x-mark h-5 w-5" />
          </button>
        </div>
      </div>

      {pinnedId === null && currentId !== pageId && pageId && (
        <button
          type="button"
          onClick={() => pin(pageId)}
          className="flex-none border-b border-gray-200 bg-gray-50 px-5 py-2 text-left text-xs text-gray-500 hover:text-gray-700"
        >
          Page: <code>{pageId}</code>
        </button>
      )}

      <div className="flex-1 overflow-y-auto px-5 py-4">
        {currentId ? (
          <AnnotationCard
            id={currentId}
            annotation={loaded?.id === currentId ? loaded.annotation : null}
            error={loaded?.id === currentId ? loaded.error : null}
            loading={loading}
            inventory={inventory.get(currentId)}
            inventoryHref={inventoryUrl()}
            onOpenId={pin}
          />
        ) : (
          <p className="text-sm text-gray-500">This page isn't in the inventory, and nothing under the mouse is annotated.</p>
        )}
      </div>
    </aside>
  );
}
