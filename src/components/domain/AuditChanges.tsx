import type { AuditChange } from "../../model/audit-events";
import DataTable from "../primitives/DataTable";
import type { DataTableColumn } from "../primitives/DataTable";
import Text from "../primitives/Text";

interface Props {
  changes: AuditChange[];
}

const value = (v: string | undefined) =>
  v === undefined ? (
    <Text tone="subtle">None</Text>
  ) : (
    <Text mono size="xs">
      {v}
    </Text>
  );

const columns: DataTableColumn<AuditChange>[] = [
  {
    key: "field",
    header: "Field",
    render: (c) => (
      <Text mono size="xs" tone="strong">
        {c.field}
      </Text>
    ),
  },
  { key: "before", header: "Before", render: (c) => value(c.before) },
  { key: "after", header: "After", render: (c) => value(c.after) },
];

/** What one audited change did, field by field: the value before and after. */
export default function AuditChanges({ changes }: Props) {
  return (
    <DataTable
      columns={columns}
      rows={changes}
      getRowKey={(c) => c.field}
      emptyMessage="This event records no field changes."
    />
  );
}
