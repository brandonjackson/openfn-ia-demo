import type { IANode } from "../ia-tree";
import type { HealthState, StatusPageData, SystemStatus, WorkflowStatus } from "../page-data";
import PageHeader from "../components/PageHeader";
import Callout from "../components/Callout";
import SectionHeading from "../components/SectionHeading";
import DataTable from "../components/DataTable";
import type { DataTableColumn } from "../components/DataTable";
import StatusBadge from "../components/StatusBadge";
import TextLink from "../components/TextLink";

interface Props {
  node: IANode;
  ancestors: { node: IANode; path: string }[];
  currentPath: string;
  data: StatusPageData;
}

const severity: Record<HealthState, number> = { down: 0, degraded: 1, operational: 2 };
const worstFirst = <T extends { status: HealthState }>(rows: T[]) =>
  [...rows].sort((a, b) => severity[a.status] - severity[b.status]);

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;

const systemColumns: DataTableColumn<SystemStatus>[] = [
  { key: "name", header: "System", render: (s) => <TextLink to={s.linkTo}>{s.name}</TextLink> },
  { key: "status", header: "Status", render: (s) => <StatusBadge status={s.status} /> },
  { key: "note", header: "Details", render: (s) => <span className="text-gray-500">{s.note}</span> },
];

const workflowColumns: DataTableColumn<WorkflowStatus>[] = [
  { key: "name", header: "Workflow", render: (w) => <span className="font-mono text-gray-900">{w.name}</span> },
  {
    key: "project",
    header: "Project",
    render: (w) => (
      <span className="block max-w-56 truncate" title={w.project}>
        <TextLink to={`/projects/${w.projectId}/workflows`}>{w.project}</TextLink>
      </span>
    ),
  },
  { key: "status", header: "Status", render: (w) => <StatusBadge status={w.status} /> },
  { key: "lastRun", header: "Last run", render: (w) => <span className="text-gray-500">{w.lastRun}</span> },
  { key: "note", header: "Details", render: (w) => <span className="text-gray-500">{w.note}</span> },
];

/**
 * Monitoring, right now: what's up, degraded or failing. Problems are
 * summarised at the top and sorted to the top of each table.
 */
export default function StatusTemplate({ node, ancestors, data }: Props) {
  const systemIssues = data.systems.filter((s) => s.status !== "operational");
  const workflowIssues = data.workflows.filter((w) => w.status !== "operational");
  const issues = [...workflowIssues, ...systemIssues];

  return (
    <div className="space-y-8">
      <PageHeader
        breadcrumbs={{
        ancestors: ancestors.map((a) => ({ label: a.node.label, path: a.path })),
        current: node.label,
      }}
        title={node.label}
        description={`${node.description ?? ""} Checked ${data.checkedAt}.`.trim()}
      />

      {issues.length === 0 ? (
        <Callout variant="success" title="Everything is operational">
          All systems and workflows are running normally.
        </Callout>
      ) : (
        <Callout variant="warning" title={`${plural(issues.length, "issue")} need attention`}>
          {issues.map((i) => `${i.name} is ${i.status}`).join("; ")}.
        </Callout>
      )}

      <section>
        <SectionHeading
          title="Systems"
          description={`${plural(data.systems.length - systemIssues.length, "system")} of ${data.systems.length} operational.`}
        />
        <DataTable columns={systemColumns} rows={worstFirst(data.systems)} getRowKey={(s) => s.id} />
      </section>

      <section>
        <SectionHeading
          title="Workflows"
          description={`${plural(data.workflows.length - workflowIssues.length, "workflow")} of ${data.workflows.length} operational.`}
        />
        <DataTable
          columns={workflowColumns}
          rows={worstFirst(data.workflows)}
          getRowKey={(w) => w.projectId + w.id}
        />
      </section>
    </div>
  );
}
