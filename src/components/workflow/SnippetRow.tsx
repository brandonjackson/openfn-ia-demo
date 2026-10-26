import { useState } from "react";
import { ChevronRight, CornerDownLeft, Plus } from "lucide-react";
import type { Snippet } from "../../mock-data/adaptor-reference";
import CodeBlock from "../CodeBlock";

interface Props {
  snippet: Snippet;
  /** Inserts the snippet into the open step; hidden when the step is read-only. */
  onInsert?: (snippet: Snippet) => void;
  defaultExpanded?: boolean;
  /** `card` shows the code straight away on a light background, for the reference column. */
  variant?: "row" | "card";
}

/**
 * One operation in the adaptor reference: its name and what it does, which
 * expands to show the code, with a button to insert it into the open step.
 */
export default function SnippetRow({ snippet, onInsert, defaultExpanded = false, variant = "row" }: Props) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  if (variant === "card") {
    return (
      <div className="space-y-1.5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <code className="font-mono text-sm text-gray-900">{snippet.title}</code>
            <p className="mt-0.5 text-xs text-gray-500">{snippet.description}</p>
          </div>
          {onInsert && (
            <button
              type="button"
              onClick={() => onInsert(snippet)}
              title="Insert into the open step"
              className="inline-flex flex-shrink-0 items-center gap-1 rounded-md border border-gray-200 px-2 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50"
            >
              <CornerDownLeft size={12} className="text-gray-400" /> Insert
            </button>
          )}
        </div>
        <CodeBlock code={snippet.code} tone="light" />
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-gray-200">
      <div className="flex items-center gap-2 px-2 py-1.5">
        <button
          type="button"
          onClick={() => setExpanded((e) => !e)}
          aria-expanded={expanded}
          className="flex min-w-0 flex-1 items-center gap-2 text-left"
        >
          <ChevronRight size={14} className={`flex-shrink-0 text-gray-300 transition-transform ${expanded ? "rotate-90" : ""}`} />
          <code className="flex-shrink-0 rounded bg-gray-100 px-1.5 py-0.5 font-mono text-xs text-gray-800">{snippet.title}</code>
          <span className="truncate text-xs text-gray-500">{snippet.description}</span>
        </button>
        {onInsert && (
          <button
            type="button"
            onClick={() => onInsert(snippet)}
            title="Insert into the open step"
            className="inline-flex flex-shrink-0 items-center gap-1 rounded-md px-1.5 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50"
          >
            <Plus size={12} /> Insert
          </button>
        )}
      </div>
      {expanded && (
        <div className="px-2 pb-2">
          <CodeBlock code={snippet.code} />
        </div>
      )}
    </div>
  );
}
