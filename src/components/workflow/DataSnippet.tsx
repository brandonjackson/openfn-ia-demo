import { useState } from "react";
import type { ReactNode } from "react";
import { ChevronDown, ChevronRight, Maximize2, Minimize2 } from "lucide-react";

interface Props {
  title: string;
  /** The full content, one entry per line. */
  lines: string[];
  /** A short tag before each line, e.g. the log line's source. */
  tags?: string[];
  /** Right of the title, e.g. a line count or the dataclip's name. */
  meta?: ReactNode;
  /** How many lines the compact view shows before "more". */
  previewLines?: number;
  /** Shown instead of the lines when there's nothing to show. */
  empty?: string;
  /**
   * Fills its container at full width: every line, complete, with the
   * container grown to fit 80 columns. Compact otherwise, with the first few
   * lines cut at the edge.
   */
  expanded?: boolean;
  onExpand?: () => void;
  onCollapse?: () => void;
  /** Folded to its header, e.g. while another section is expanded. */
  folded?: boolean;
  /** Dark for logs; light for data that sits among form controls. */
  tone?: "dark" | "light";
  /** Names what the expand control does, when it opens the section somewhere else. */
  expandLabel?: string;
  /**
   * Takes an even share of its container's height, sharing it with the
   * sections beside it: every line, cut at the edge, scrolling within.
   */
  fill?: boolean;
}

/**
 * A section of a step's run data, Log, Input or Output, in the inspector.
 * By default it's a snippet: the first few lines, each cut at the section's
 * edge, with a count of what's left. The expand control grows the inspector
 * so the whole thing shows at full width, 80 columns, and the collapse
 * control brings the snippet back. The chevron folds the section to its
 * header so the others get the room.
 */
export default function DataSnippet({
  title,
  lines,
  tags,
  meta,
  previewLines = 6,
  empty = "Nothing here.",
  expanded = false,
  onExpand,
  onCollapse,
  folded = false,
  tone = "light",
  expandLabel,
  fill = false,
}: Props) {
  const [open, setOpen] = useState(true);
  const showing = open && !folded;
  const dark = tone === "dark";
  const shown = expanded || fill ? lines : lines.slice(0, previewLines);
  const hidden = lines.length - shown.length;
  const Chevron = showing ? ChevronDown : ChevronRight;

  return (
    <section
      aria-label={title}
      className={`flex min-h-0 flex-col ${fill && showing ? "flex-1 basis-0" : expanded && showing ? "flex-1" : "flex-none"}`}
    >
      <div className="flex h-8 flex-none items-center gap-1">
        <button
          type="button"
          onClick={() => setOpen(folded ? true : !open)}
          aria-expanded={showing}
          className="inline-flex min-w-0 items-center gap-1 rounded text-sm font-medium text-gray-800 hover:text-gray-900"
        >
          <Chevron size={14} className="flex-shrink-0 text-gray-400" />
          <span className="truncate">{title}</span>
        </button>
        {meta && <span className="ml-1 truncate text-xs text-gray-400">{meta}</span>}
        <span className="ml-auto flex flex-shrink-0 items-center">
          {expanded
            ? onCollapse && <SizeButton label={`Collapse ${title.toLowerCase()}`} icon={Minimize2} onClick={onCollapse} />
            : onExpand &&
              lines.length > 0 && <SizeButton label={expandLabel ?? `Expand ${title.toLowerCase()} to full width`} icon={Maximize2} onClick={onExpand} />}
        </span>
      </div>
      {showing && (
        <div
          className={`flex min-h-0 flex-col overflow-hidden rounded-lg border ${
            expanded || fill ? "flex-1" : ""
          } ${dark ? "border-gray-800 bg-gray-900 text-gray-100" : "border-gray-200 bg-gray-50 text-gray-800"}`}
        >
          {lines.length === 0 ? (
            <p className={`px-3 py-2.5 text-xs ${dark ? "text-gray-400" : "text-gray-500"}`}>{empty}</p>
          ) : (
            <pre
              className={`min-h-0 font-mono text-xs leading-5 ${
                expanded ? "flex-1 overflow-auto px-3 py-2" : fill ? "flex-1 overflow-y-auto overflow-x-hidden px-3 py-2" : "overflow-hidden px-3 py-2"
              }`}
            >
              {shown.map((line, i) => (
                <div key={i} className={`flex gap-2 ${expanded ? "whitespace-pre" : "min-w-0"}`}>
                  {tags && (
                    <span className={`w-7 flex-shrink-0 select-none ${dark ? "text-sky-300" : "text-gray-400"}`}>
                      {tags[i] ?? ""}
                    </span>
                  )}
                  <code
                    className={
                      expanded ? "whitespace-pre" : fill ? "block min-w-0 overflow-hidden text-ellipsis whitespace-pre" : "block min-w-0 truncate"
                    }
                  >
                    {line}
                  </code>
                </div>
              ))}
            </pre>
          )}
          {!expanded && hidden > 0 && (
            <button
              type="button"
              onClick={onExpand}
              className={`flex-none border-t px-3 py-1.5 text-left text-xs font-medium ${
                dark
                  ? "border-gray-800 text-gray-400 hover:bg-gray-800 hover:text-gray-200"
                  : "border-gray-200 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
              }`}
            >
              {hidden} more {hidden === 1 ? "line" : "lines"}
            </button>
          )}
        </div>
      )}
    </section>
  );
}

function SizeButton({ label, icon: Icon, onClick }: { label: string; icon: typeof Maximize2; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className="inline-flex h-6 w-6 items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-700"
    >
      <Icon size={13} />
    </button>
  );
}
