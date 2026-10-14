import { useAnnotations } from "../../annotations/annotations-context";
import { ANNOTATIONS_BRANCH, getAnnotation, inventory, inventoryUrl } from "../../annotations/source";
import Heading from "../Heading";
import IconButton from "../IconButton";
import TextLink from "../TextLink";
import AnnotationCard from "./AnnotationCard";

export const ANNOTATIONS_PANEL_WIDTH = 440;

/**
 * Right-hand panel showing the behaviour annotation for whatever the mouse
 * is over (or the page), from the bundled copy of Lightning's annotations.
 */
export default function AnnotationsPanel() {
  const { open, setOpen, currentId, pageId, pinnedId, pin } = useAnnotations();
  if (!open) return null;

  return (
    <aside
      data-devtools
      style={{ width: ANNOTATIONS_PANEL_WIDTH }}
      className="fixed inset-y-0 right-0 z-[9998] flex flex-col border-l border-gray-200 bg-white shadow-xl"
      aria-label="Annotations"
    >
      <div className="flex h-20 flex-none items-center justify-between gap-2 border-b border-gray-200 px-5">
        <div className="min-w-0">
          <Heading as="p" size="sm">
            Annotations
          </Heading>
          <p className="truncate text-xs text-gray-500" title={ANNOTATIONS_BRANCH}>
            {pinnedId ? "Pinned" : "Following the mouse"} · copy of {ANNOTATIONS_BRANCH}
          </p>
        </div>
        <div className="flex items-center gap-1">
          <IconButton
            icon={pinnedId ? "hero-lock-closed" : "hero-lock-open"}
            label={pinnedId ? "Unpin and follow the mouse" : "Pin this annotation"}
            active={!!pinnedId}
            onClick={() => pin(pinnedId ? null : currentId)}
          />
          <IconButton icon="hero-x-mark" label="Close" onClick={() => setOpen(false)} />
        </div>
      </div>

      {pinnedId === null && currentId !== pageId && pageId && (
        <p className="flex-none border-b border-gray-200 bg-gray-50 px-5 py-2 text-xs">
          <TextLink onClick={() => pin(pageId)}>
            Page: <code>{pageId}</code>
          </TextLink>
        </p>
      )}

      <div className="flex-1 overflow-y-auto px-5 py-4">
        {currentId ? (
          <AnnotationCard
            id={currentId}
            annotation={getAnnotation(currentId)}
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
