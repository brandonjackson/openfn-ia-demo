import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Workflow } from "lucide-react";
import type { IANode } from "../ia-tree";
import type { ProjectWorkflowsPageData, WorkflowListItem } from "../page-data";
import PageHeader from "../components/PageHeader";
import Button from "../components/Button";
import SectionHeading from "../components/SectionHeading";
import { Select } from "../components/FormControls";
import WorkflowRow from "../components/WorkflowRow";
import EmptyState from "../components/EmptyState";

interface Props {
  node: IANode;
  ancestors: { node: IANode; path: string }[];
  currentPath: string;
  data: ProjectWorkflowsPageData;
}

const sorts: Record<string, (a: WorkflowListItem, b: WorkflowListItem) => number> = {
  "Sort by: Activity": (a, b) => (b.lastRunAt ?? "").localeCompare(a.lastRunAt ?? ""),
  "Sort by: Last updated": (a, b) => b.updatedAt.localeCompare(a.updatedAt),
  "Sort by: Name": (a, b) => a.name.localeCompare(b.name),
};
const sortOptions = Object.keys(sorts);

export default function ProjectWorkflowsTemplate({ node, ancestors, data }: Props) {
  const navigate = useNavigate();
  const [sort, setSort] = useState(sortOptions[0]);
  const workflows = [...data.workflows].sort(sorts[sort]);
  const count = data.workflows.length;

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

      {count > 0 ? (
        <section>
          <SectionHeading
            variant="label"
            title={`${count} workflow${count === 1 ? "" : "s"}`}
            action={
              <Select
                aria-label="Sort workflows"
                options={sortOptions}
                value={sort}
                onChange={(e) => setSort(e.target.value)}
              />
            }
          />
          <div className="space-y-3">
            {workflows.map((w) => (
              <WorkflowRow key={w.id} workflow={w} />
            ))}
          </div>
        </section>
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
