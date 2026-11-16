// Throwaway mock for the History redesign discussion. Not for commit.
import type { Meta, StoryObj } from "@storybook/react-vite";
import { ArrowLeftRight, Columns3, Workflow } from "lucide-react";
import DataTable, { type DataTableColumn } from "../../components/primitives/DataTable";
import IconTile from "../../components/primitives/IconTile";
import Text from "../../components/primitives/Text";
import Stack from "../../components/primitives/Stack";
import Inline from "../../components/primitives/Inline";
import Button from "../../components/primitives/Button";
import Badge from "../../components/primitives/Badge";
import StatusPill from "../../components/domain/StatusPill";
import type { RunStatus } from "../../model/workflow";

interface Row {
  id: string;
  kind: "workflow" | "channel";
  name: string;
  status: RunStatus;
  code?: number;
  when: string;
  timing: string;
  outcome?: string;
  project: string;
  endpoint?: string;
}

const rows: Row[] = [
  { id: "a3f9c2e1", kind: "workflow", name: "National ID verification", status: "success", when: "2 min ago", timing: "1.2 s · 2 runs", outcome: "Success", project: "Civil registry" },
  { id: "req-71bd04", kind: "channel", name: "DHIS2 aggregate push", status: "failed", code: 502, when: "5 min ago", timing: "840 ms", project: "Civil registry", endpoint: "POST /api/dataValueSets" },
  { id: "c81e0d77", kind: "workflow", name: "Hardship grant approval", status: "waiting", when: "12 min ago", timing: "Waiting on district officer", outcome: "Needs follow-up", project: "Social protection" },
  { id: "req-0e5a9c", kind: "channel", name: "Inbound SMS webhook", status: "success", code: 200, when: "14 min ago", timing: "96 ms", project: "Social protection", endpoint: "POST /i/sms-intake" },
  { id: "f20b6a3d", kind: "workflow", name: "Facility registry sync", status: "failed", when: "1 h ago", timing: "4.8 s · 3 runs", outcome: "Failure", project: "Civil registry" },
];

const core: DataTableColumn<Row> = {
  key: "core",
  header: "Name",
  render: (r) => (
    <Inline gap="sm">
      <IconTile icon={r.kind === "workflow" ? Workflow : ArrowLeftRight} tone="white" size="sm" />
      <Stack gap="none">
        <Text tone="strong" size="sm" truncate>{r.name}</Text>
        <Text tone="subtle" size="xs" mono>{r.id}</Text>
      </Stack>
    </Inline>
  ),
};

// Mock only: the real build needs Stack align="end" and a way to hide below sm in the primitives.
const status: DataTableColumn<Row> = {
  key: "status",
  header: "Status",
  align: "right",
  render: (r) => (
    <div className="flex flex-col items-end">
      <Inline gap="xs" justify="end">
        {r.code && <span className="max-sm:hidden"><Text tone="muted" size="xs" mono>{r.code}</Text></span>}
        <StatusPill status={r.status} />
      </Inline>
      <span className="max-sm:hidden"><Text tone="subtle" size="xs" nowrap>{`${r.when} · ${r.timing}`}</Text></span>
    </div>
  ),
};

const extras: DataTableColumn<Row>[] = [
  { key: "outcome", header: "Outcome", render: (r) => (r.outcome ? <Badge label={r.outcome} /> : null) },
  { key: "project", header: "Project", render: (r) => <Text size="sm">{r.project}</Text> },
  { key: "endpoint", header: "Endpoint", render: (r) => (r.endpoint ? <Text size="xs" mono tone="muted">{r.endpoint}</Text> : null) },
];

function Mock({ columns }: { columns: DataTableColumn<Row>[] }) {
  return (
    <Stack gap="sm">
      <Inline justify="end">
        <Button variant="secondary" size="sm" icon={Columns3}>Columns</Button>
      </Inline>
      <DataTable columns={columns} rows={rows} getRowKey={(r) => r.id} onRowClick={() => {}} />
    </Stack>
  );
}

const meta: Meta = { title: "Mocks/History rows" };
export default meta;

export const Default: StoryObj = { render: () => <Mock columns={[core, status]} /> };
export const WithExtraColumns: StoryObj = { render: () => <Mock columns={[core, status, ...extras]} /> };
