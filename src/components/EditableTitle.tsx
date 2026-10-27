import { useEffect, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import { Pencil } from "lucide-react";

interface Props {
  value: string;
  /** Called with the new name when the edit is committed (Enter or blur). An empty name is discarded. */
  onChange?: (value: string) => void;
  /** Plain text, with no way to edit. */
  readOnly?: boolean;
  /** What the title is, for assistive tech, e.g. "Step name". */
  label?: string;
  className?: string;
}

/**
 * A heading that turns into a text input when clicked, so a name can be
 * renamed in place without a separate form field. Enter or blur commits
 * the edit and Escape cancels it.
 */
export default function EditableTitle({ value, onChange, readOnly = false, label = "Name", className = "" }: Props) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) input.current?.select();
  }, [editing]);

  const commit = () => {
    const next = draft.trim();
    if (next && next !== value) onChange?.(next);
    else setDraft(value);
    setEditing(false);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") commit();
    if (e.key === "Escape") {
      setDraft(value);
      setEditing(false);
    }
  };

  const text = `truncate text-sm font-semibold text-gray-900 ${className}`;

  if (readOnly || !onChange) return <h2 className={`min-w-0 ${text}`}>{value}</h2>;

  if (editing)
    return (
      <input
        ref={input}
        aria-label={label}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={onKeyDown}
        className={`-mx-1.5 min-w-0 flex-1 rounded-md border border-blue-500 bg-white px-1.5 py-0.5 text-sm font-semibold text-gray-900 outline-none ring-1 ring-blue-500 ${className}`}
      />
    );

  return (
    <button
      type="button"
      onClick={() => {
        setDraft(value);
        setEditing(true);
      }}
      title={`Rename (${label.toLowerCase()})`}
      className="group -mx-1.5 flex min-w-0 items-center gap-1.5 rounded-md px-1.5 py-0.5 text-left hover:bg-gray-100"
    >
      <h2 className={text}>{value}</h2>
      <Pencil size={12} className="flex-shrink-0 text-gray-300 opacity-0 transition-opacity group-hover:opacity-100" />
    </button>
  );
}
