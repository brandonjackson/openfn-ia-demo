import { FileImage, FileSpreadsheet, FileText, FileType, X } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { HandbookFileKind } from "../page-data";

interface Props {
  name: string;
  kind: HandbookFileKind;
  /** Human-readable size, e.g. "240 KB". */
  size: string;
  /** Shown on hover, e.g. who added the file and when. */
  detail?: string;
  /** Shows a remove button on hover when provided. */
  onRemove?: () => void;
}

const kinds: Record<HandbookFileKind, { label: string; icon: LucideIcon; color: string }> = {
  pdf: { label: "PDF", icon: FileType, color: "text-red-500" },
  doc: { label: "DOC", icon: FileText, color: "text-blue-500" },
  sheet: { label: "SHEET", icon: FileSpreadsheet, color: "text-green-600" },
  text: { label: "TEXT", icon: FileText, color: "text-gray-500" },
  image: { label: "IMAGE", icon: FileImage, color: "text-purple-500" },
};

/**
 * A small card for an uploaded file: name, type tag and size, in the style of
 * a Claude project's knowledge files.
 */
export default function FileTile({ name, kind, size, detail, onRemove }: Props) {
  const { label, icon: Icon, color } = kinds[kind];
  return (
    <div
      className="group relative flex h-28 flex-col justify-between rounded-lg border border-gray-200 bg-white p-3 transition-colors hover:border-gray-300"
      title={detail ? `${name}\n${detail}` : name}
    >
      <p className="line-clamp-3 break-words pr-4 text-xs font-medium text-gray-900">{name}</p>
      <div className="flex items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1 rounded border border-gray-200 px-1.5 py-0.5 text-[10px] font-semibold tracking-wide text-gray-600">
          <Icon size={11} className={color} />
          {label}
        </span>
        <span className="text-[11px] text-gray-400">{size}</span>
      </div>
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remove ${name}`}
          className="absolute right-1.5 top-1.5 rounded p-0.5 text-gray-400 opacity-0 transition-opacity hover:bg-gray-100 hover:text-gray-700 focus:opacity-100 group-hover:opacity-100"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}
