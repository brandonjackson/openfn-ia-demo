import { useRef } from "react";
import { Plus } from "lucide-react";
import type { HandbookFile } from "../page-data";
import Button from "./Button";
import FileDropzone from "./FileDropzone";
import FileTile from "./FileTile";

interface Props {
  files: HandbookFile[];
  /** Total bytes the panel can hold, used for the capacity meter. */
  capacityBytes: number;
  title?: string;
  description?: string;
  onAdd?: (files: File[]) => void;
  onRemove?: (id: string) => void;
}

const ACCEPT = ".pdf,.doc,.docx,.xls,.xlsx,.csv,.txt,.md,.png,.jpg,.jpeg";

/**
 * Side panel of uploaded files, modelled on a Claude project's knowledge:
 * an add button, a capacity meter, a drop zone and a grid of file tiles.
 */
export default function FilesPanel({
  files,
  capacityBytes,
  title = "Files",
  description,
  onAdd,
  onRemove,
}: Props) {
  const input = useRef<HTMLInputElement>(null);
  const used = files.reduce((sum, f) => sum + f.bytes, 0);
  const percent = Math.min(100, Math.round((used / capacityBytes) * 100));

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
          {description && <p className="mt-0.5 text-xs text-gray-500">{description}</p>}
        </div>
        {onAdd && (
          <>
            <Button variant="secondary" size="xs" icon={Plus} onClick={() => input.current?.click()}>
              Add
            </Button>
            <input
              ref={input}
              type="file"
              multiple
              accept={ACCEPT}
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.length) onAdd(Array.from(e.target.files));
                e.target.value = "";
              }}
            />
          </>
        )}
      </div>

      <div className="mt-4">
        <div className="h-1.5 overflow-hidden rounded-full bg-gray-100">
          <div
            className={`h-full rounded-full ${percent >= 90 ? "bg-red-500" : "bg-indigo-500"}`}
            style={{ width: `${Math.max(percent, used > 0 ? 1 : 0)}%` }}
          />
        </div>
        <p className="mt-1.5 text-xs text-gray-500">{percent}% of capacity used</p>
      </div>

      {onAdd && (
        <div className="mt-4">
          <FileDropzone
            onFiles={onAdd}
            accept={ACCEPT}
            compact={files.length > 0}
            title={files.length > 0 ? "Drop files to add them" : "Drop files here or click to upload"}
            description={files.length > 0 ? undefined : "PDF, DOCX, XLSX, CSV, TXT, MD or images"}
          />
        </div>
      )}

      {files.length > 0 ? (
        <div className="mt-4 grid grid-cols-2 gap-2">
          {files.map((f) => (
            <FileTile
              key={f.id}
              name={f.name}
              kind={f.kind}
              size={f.size}
              detail={`Added by ${f.addedBy}, ${f.addedAt}`}
              onRemove={onRemove ? () => onRemove(f.id) : undefined}
            />
          ))}
        </div>
      ) : (
        !onAdd && <p className="mt-4 text-center text-xs text-gray-400">No files yet.</p>
      )}
    </div>
  );
}
