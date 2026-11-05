import { useState } from "react";
import { Plus, Workflow } from "lucide-react";
import type { PageProps } from "../model/ia-tree";
import type { ProjectWorkflowsPageData, WorkflowListItem } from "../model/page-data";
import PageHeader from "../components/patterns/PageHeader";
import Button from "../components/primitives/Button";
import SectionHeading from "../components/primitives/SectionHeading";
import { Select } from "../components/primitives/FormControls";
import WorkflowRow from "../components/domain/WorkflowRow";
import EmptyState from "../components/primitives/EmptyState";

export interface ProjectWorkflowsPageProps extends PageProps<ProjectWorkflowsPageData> {
  /** Opens a blank workflow in this project. */
  onNewWorkflow: () => void;
}

const sorts: Record<string, (a: WorkflowListItem, b: WorkflowListItem) => number> = {
  "Sort by: Activity": (a, b) => (b.lastRunAt ?? "").localeCompare(a.lastRunAt ?? ""),
  "Sort by: Last updated": (a, b) => b.updatedAt.localeCompare(a.updatedAt),
  "Sort by: Name": (a, b) => a.name.localeCompare(b.name),
};
const sortOptions = Object.keys(sorts);

export default function ProjectWorkflowsPage({ node, ancestors, data, onNewWorkflow }: ProjectWorkflowsPageProps) {
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
            onClick={onNewWorkflow}
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
