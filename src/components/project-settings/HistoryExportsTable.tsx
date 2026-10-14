import { EmptyState, Table, Td, Th, Tr } from "../Table";
import TableAction from "../TableAction";
import type { ExportStatus, ProjectFile } from "../../mock-data/project-settings";
import { findUser, fullName } from "../../mock-data/users";
import { relativeTime } from "../../utils/relativeTime";

interface Props {
  files: ProjectFile[];
}

/** data_tables.ex `format_export_status/1`: "in_progress" -> "In progress". */
function formatStatus(status: ExportStatus): string {
  const s = status.replace(/_/g, " ");
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/**
 * Lightning's `DataTables.history_exports_table`: Export Date, Filename,
 * Export Requested By, Status and a Download action (disabled until the
 * export completes).
 */
export default function HistoryExportsTable({ files }: Props) {
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
          <Th />
        </Tr>
      }
    >
      {files.map((f) => {
        const user = findUser(f.createdByUserId);
        return (
          <Tr key={f.id}>
            <Td>
              <span title={f.insertedAt}>{relativeTime(f.insertedAt)}</span>
            </Td>
            <Td>{f.path ? f.path.split("/").pop() : <em>Pending</em>}</Td>
            <Td>{user ? fullName(user) : ""}</Td>
            <Td>{formatStatus(f.status)}</Td>
            <Td className="flex justify-end py-0.5">
              {f.status === "completed" ? (
                <TableAction>Download</TableAction>
              ) : (
                <span title="Export is not yet ready for download">
                  <TableAction disabled>Download</TableAction>
                </span>
              )}
            </Td>
          </Tr>
        );
      })}
    </Table>
  );
}
