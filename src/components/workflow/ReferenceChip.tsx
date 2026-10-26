import { X, Zap } from "lucide-react";
import type { AssistantReference } from "../../mock-data/assistant";
import { AdaptorIcon } from "./AdaptorIcon";

/**
 * A small chip naming what a message to the assistant is about, e.g. a step
 * picked from the canvas: its adaptor icon and name, with an X to drop it
 * while it's still in the chat input. In a sent message it has no X.
 */
export default function ReferenceChip({ reference, onRemove }: { reference: AssistantReference; onRemove?: () => void }) {
  return (
    <span className="inline-flex max-w-full items-center gap-1.5 rounded-md border border-blue-200 bg-blue-50 py-0.5 pl-1 pr-1.5 text-xs font-medium text-blue-800">
      {reference.adaptor ? (
        <span className="inline-flex [&>*]:h-4! [&>*]:w-4! [&>*]:rounded! [&>*]:text-[7px]!">
          <AdaptorIcon adaptor={reference.adaptor} size="xs" />
        </span>
      ) : (
        <Zap size={12} className="text-blue-500" />
      )}
      <span className="truncate">{reference.label}</span>
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remove ${reference.label}`}
          title="Remove"
          className="-mr-0.5 rounded p-0.5 text-blue-500 hover:bg-blue-100 hover:text-blue-800"
        >
          <X size={11} />
        </button>
      )}
    </span>
  );
}
