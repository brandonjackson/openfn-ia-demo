import { Link, useNavigate } from "react-router-dom";
import { Plus, Workflow } from "lucide-react";
import type { IANode } from "../ia-tree";
import type { ProjectComponentItem, ProjectWorkflowsPageData } from "../page-data";
import PageHeader from "../components/PageHeader";
import Button from "../components/Button";
import DataTable from "../components/DataTable";
import type { DataTableColumn } from "../components/DataTable";
import EmptyState from "../components/EmptyState";

interface Props {
  node: IANode;
  ancestors: { node: IANode; path: string }[];
  currentPath: string;
  data: ProjectWorkflowsPageData;
}

const columns: DataTableColumn<ProjectComponentItem>[] = [
  {
    key: "name",
    header: "Name",
    render: (w) => (
      <Link
        to={`/workflow-editor/${w.id}`}
        className="inline-flex items-center gap-2 font-mono text-gray-900 hover:text-blue-600"
      >
        <Workflow size={14} className="text-gray-400" />
        {w.name}
      </Link>
    ),
  },
  { key: "description", header: "Description", render: (w) => w.description },
];

export default function ProjectWorkflowsTemplate({ node, ancestors, data }: Props) {
  const navigate = useNavigate();
  return (
    <div className="space-y-8">
      <PageHeader
        breadcrumbs={{
          ancestors: ancestors.map((a) => ({ label: a.node.label, path: a.path })),
          current: node.label,
        }}
        title={node.label}
        description={node.description}
        actions={
          <Button
            icon={Plus}
            size="sm"
            onClick={() => navigate(`/workflow-editor/new?project=${data.projectId}`)}
          >
            New workflow
          </Button>
        }
      />

      {data.workflows.length > 0 ? (
        <DataTable columns={columns} rows={data.workflows} getRowKey={(w) => w.id} />
      ) : (
        <EmptyState
          icon={Workflow}
          title="No workflows yet"
          description="Workflows move data between your connected systems."
        />
      )}
    </div>
  );
}
