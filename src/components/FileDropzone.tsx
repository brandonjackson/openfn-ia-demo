import { useRef, useState } from "react";
import type { DragEvent } from "react";
import { Upload } from "lucide-react";

interface Props {
  onFiles: (files: File[]) => void;
  /** Main line of text, e.g. "Drop files here". */
  title?: string;
  /** Helper text under the title, e.g. accepted file types. */
  description?: string;
  /** Passed to the file input, e.g. ".pdf,.docx". */
  accept?: string;
  /** A slimmer layout for when files are already listed below. */
  compact?: boolean;
}

/**
 * A dashed area that takes files by drag and drop, or by click to browse.
 */
export default function FileDropzone({
  onFiles,
  title = "Drop files here or click to upload",
  description,
  accept,
  compact = false,
}: Props) {
  const input = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files.length) onFiles(Array.from(e.dataTransfer.files));
  };

  return (
    <button
      type="button"
      onClick={() => input.current?.click()}
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      className={`flex w-full flex-col items-center justify-center rounded-lg border-2 border-dashed text-center transition-colors ${
        compact ? "gap-1 px-4 py-3" : "gap-2 px-6 py-8"
      } ${dragging ? "border-indigo-400 bg-indigo-50" : "border-gray-200 bg-gray-50 hover:border-gray-300"}`}
    >
      <Upload size={compact ? 16 : 22} className={dragging ? "text-indigo-500" : "text-gray-400"} />
      <span className="text-sm text-gray-600">{title}</span>
      {description && <span className="text-xs text-gray-400">{description}</span>}
      <input
        ref={input}
        type="file"
        multiple
        accept={accept}
        className="hidden"
        onChange={(e) => {
          if (e.target.files?.length) onFiles(Array.from(e.target.files));
          e.target.value = "";
        }}
      />
    </button>
  );
}
