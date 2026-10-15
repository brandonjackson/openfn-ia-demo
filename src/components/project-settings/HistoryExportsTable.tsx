import { EmptyState, Table, Td, Th, Tr } from "../Table";
import Button from "../Button";
import type { ExportStatus, ProjectFile } from "../../types/project-settings";
import type { User } from "../../types/users";
import { capitalize, formatAgo, fullName } from "../../utils/format";

interface Props {
  files: ProjectFile[];
  /** Users to show who requested each export. */
  users: User[];
}

/** data_tables.ex `format_export_status/1`: "in_progress" -> "In progress". */
function formatStatus(status: ExportStatus): string {
  return capitalize(status.replace(/_/g, " "));
}

/**
 * Lightning's `DataTables.history_exports_table`: Export Date, Filename,
 * Export Requested By, Status and a Download action (disabled until the
 * export completes).
 */
export default function HistoryExportsTable({ files, users }: Props) {
  if (files.length === 0) {
    return <EmptyState icon="hero-folder-arrow-down" message="No history exports found for this project." />;
  }
  return (
    <Table
      id="project_users_table-table"
      header={
        <Tr>
          <Th>Export Date</Th>
          <Th>Filename</Th>
          <Th>Export Requested By</Th>
          <Th>Status</Th>
          <Th actions />
        </Tr>
      }
    >
      {files.map((f) => {
        const user = users.find((u) => u.id === f.createdByUserId);
        return (
          <Tr key={f.id}>
            <Td>
              <span title={f.insertedAt}>{formatAgo(f.insertedAt)}</span>
            </Td>
            <Td>{f.path ? f.path.split("/").pop() : <em>Pending</em>}</Td>
            <Td>{user ? fullName(user) : ""}</Td>
            <Td>{formatStatus(f.status)}</Td>
            <Td actions>
              <Button
                theme="secondary"
                size="xs"
                disabled={f.status !== "completed"}
                tooltip={f.status === "completed" ? undefined : "Export is not yet ready for download"}
              >
                Download
              </Button>
            </Td>
          </Tr>
        );
      })}
    </Table>
  );
}
