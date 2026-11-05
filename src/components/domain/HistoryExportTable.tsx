import { Download, FolderDown } from "lucide-react";
import type { BadgeTone, HistoryExport } from "../../model/page-data";
import type { HistoryExportStatus } from "../../model/project-settings";
import DataTable, { type DataTableColumn } from "../primitives/DataTable";
import Badge from "../primitives/Badge";
import Button from "../primitives/Button";
import EmptyState from "../primitives/EmptyState";
import Text from "../primitives/Text";

const statuses: Record<HistoryExportStatus, { label: string; tone: BadgeTone }> = {
  enqueued: { label: "Enqueued", tone: "gray" },
  processing: { label: "Processing", tone: "yellow" },
  completed: { label: "Completed", tone: "green" },
  failed: { label: "Failed", tone: "red" },
};

interface Props {
  exports: HistoryExport[];
  /** Downloads a completed export. */
  onDownload: (id: string) => void;
}

/** A project's work order history exports, newest first, each downloadable once it's ready. */
export default function HistoryExportTable({ exports, onDownload }: Props) {
  if (exports.length === 0)
    return (
      <EmptyState
        icon={FolderDown}
        title="No history exports found for this project."
        description="Export your work order history to download it as a file."
      />
    );

  const columns: DataTableColumn<HistoryExport>[] = [
    { key: "date", header: "Export date", render: (e) => e.createdAt },
    {
      key: "file",
      header: "Filename",
      render: (e) =>
        e.fileName ? (
          <Text mono size="xs">
            {e.fileName}
          </Text>
        ) : (
          <Text tone="subtle">Not ready</Text>
        ),
    },
    { key: "by", header: "Requested by", render: (e) => e.requestedBy },
    { key: "status", header: "Status", render: (e) => <Badge {...statuses[e.status]} /> },
    {
      key: "actions",
      header: "",
      align: "right",
      render: (e) => (
        <Button
          variant="secondary"
          size="xs"
          icon={Download}
          disabled={e.status !== "completed"}
          title={e.status === "completed" ? undefined : "Export is not yet ready for download"}
          onClick={() => onDownload(e.id)}
        >
          Download
        </Button>
      ),
    },
  ];
  return <DataTable columns={columns} rows={exports} getRowKey={(e) => e.id} />;
}
