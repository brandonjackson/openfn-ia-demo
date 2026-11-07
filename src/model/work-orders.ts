/** A file of the project's work order history, made on request. */
export interface HistoryExport {
  id: string;
  /** Absent until the export is ready. */
  fileName?: string;
  /** Who asked for it. */
  requestedBy: string;
  /** When it was asked for, for display. */
  createdAt: string;
  status: HistoryExportStatus;
}

/** Where a history export is in its life. */
export type HistoryExportStatus = "enqueued" | "processing" | "completed" | "failed";
