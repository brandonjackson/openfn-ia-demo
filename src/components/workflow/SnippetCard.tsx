import type { KeyboardEvent } from "react";
import { Lock, Plus } from "lucide-react";
import type { Snippet } from "../../mock-data/adaptor-reference";

interface Props {
  snippet: Snippet;
  /** Inserts the snippet at the cursor in the open step; without it the card is disabled. */
  onInsert?: (snippet: Snippet) => void;
}

/**
 * One adaptor operation as a block you can drop into the code: its name and
 * what it does over the code itself, in full and on a light background so it
 * reads like the editor. When the step can be edited the whole card inserts
 * it at the cursor, with an "Insert" tag that fills in on hover. When it
 * can't be, the card is greyed out with a not-allowed cursor.
 */
export default function SnippetCard({ snippet, onInsert }: Props) {
  const insert = onInsert ? () => onInsert(snippet) : undefined;
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (insert && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      insert();
    }
  };

  return (
    <div
      role={insert ? "button" : undefined}
      tabIndex={insert ? 0 : undefined}
      onClick={insert}
      onKeyDown={onKeyDown}
      aria-disabled={insert ? undefined : true}
      title={insert ? "Insert at the cursor" : "Read-only. Edit in a sandbox to insert snippets."}
      className={`group overflow-hidden rounded-lg border bg-white ${
        insert
          ? "cursor-pointer border-gray-200 transition-colors hover:border-indigo-300 hover:shadow-sm focus-visible:border-indigo-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-100"
          : "cursor-not-allowed border-dashed border-gray-200 opacity-60"
      }`}
    >
      <div className="flex items-start justify-between gap-3 px-3 pt-2.5 pb-2">
        <div className="min-w-0">
          <code className="font-mono text-[13px] font-medium text-gray-900">{snippet.title}</code>
          <p className="mt-0.5 text-xs leading-snug text-gray-500">{snippet.description}</p>
        </div>
        {insert ? (
          <span className="inline-flex flex-shrink-0 items-center gap-1 rounded-md border border-indigo-200 px-1.5 py-0.5 text-xs font-medium text-indigo-600 transition-colors group-hover:border-indigo-600 group-hover:bg-indigo-600 group-hover:text-white">
            <Plus size={12} /> Insert
          </span>
        ) : (
          <span className="inline-flex flex-shrink-0 items-center gap-1 rounded-md border border-gray-200 px-1.5 py-0.5 text-xs font-medium text-gray-400">
            <Lock size={12} /> Insert
          </span>
        )}
      </div>
      <pre className={`overflow-x-auto border-t border-gray-100 bg-gray-50 px-3 py-2 font-mono text-xs leading-relaxed text-gray-800 ${insert ? "group-hover:bg-indigo-50/40" : ""}`}>
        <code>{snippet.code}</code>
      </pre>
    </div>
  );
}
