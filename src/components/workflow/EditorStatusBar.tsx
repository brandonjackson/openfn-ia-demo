interface Props {
  /** Left-hand facts, e.g. "common@2.1", "Map fields". */
  items: string[];
  /** Right-hand facts, e.g. "Ln 7, Col 22", "Saved". */
  trailing?: string[];
}

/**
 * The thin monospace strip under the code: which adaptor and version the
 * step runs on, and the editor's state (cursor, saved).
 */
export default function EditorStatusBar({ items, trailing = [] }: Props) {
  return (
    <div className="flex h-7 flex-none items-center justify-between gap-6 border-t border-gray-100 bg-gray-50 px-4 font-mono text-[11px] text-gray-500">
      <div className="flex min-w-0 items-center gap-4">
        {items.map((item) => (
          <span key={item} className="truncate">
            {item}
          </span>
        ))}
      </div>
      <div className="flex flex-shrink-0 items-center gap-4">
        {trailing.map((item) => (
          <span key={item}>{item}</span>
        ))}
      </div>
    </div>
  );
}
