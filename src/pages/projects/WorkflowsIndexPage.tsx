import { useState } from "react";
import { Navigate, useParams } from "react-router-dom";
import Header from "../../components/Header";
import { Centered, PageContent } from "../../components/PageContent";
import ProjectBreadcrumbs from "../../components/shell/ProjectBreadcrumbs";
import ProjectMetrics from "../../components/projects/ProjectMetrics";
import WorkflowsHeader from "../../components/projects/WorkflowsHeader";
import WorkflowsTable from "../../components/projects/WorkflowsTable";
import { useToast } from "../../components/Toast";
import { projectMetricsFor, workflowStatsFor } from "../../mock-data/dashboard-stats";
import { findProject, roleIn } from "../../mock-data/projects";
import { currentUser } from "../../mock-data/users";
import { matchesQuery } from "../../utils/search";

/**
 * Inventory view `workflows-index` (WorkflowLive.Index): search, the four
 * metric cards, and the workflows table. Toggle and delete only change local
 * state.
 */
export default function WorkflowsIndexPage() {
  const { projectId } = useParams();
  const project = findProject(projectId);
  const [search, setSearch] = useState("");
  const [enabled, setEnabled] = useState<Record<string, boolean>>({});
  const [deleted, setDeleted] = useState<string[]>([]);
  const toast = useToast();

  if (!project) return <Navigate to="/projects" replace />;

  const canEdit = roleIn(project, currentUser.id) !== "viewer";
  const stats = workflowStatsFor(project.id)
    .filter((s) => !deleted.includes(s.workflow.id))
    .filter((s) => matchesQuery(search, s.workflow.name))
    .map((s) => ({ ...s, workflow: { ...s.workflow, enabled: enabled[s.workflow.id] ?? s.workflow.enabled } }));

  return (
    <PageContent header={<Header breadcrumbs={<ProjectBreadcrumbs project={project} />} />}>
      <Centered>
        <WorkflowsHeader
          count={stats.length}
          projectId={project.id}
          canCreate={canEdit}
          searchTerm={search}
          onSearch={setSearch}
        />
        <ProjectMetrics metrics={projectMetricsFor(stats)} projectId={project.id} />
        <div className="mt-8">
          <WorkflowsTable
            stats={stats}
            projectId={project.id}
            searchTerm={search}
            canDelete={canEdit}
            onToggle={(id, v) => {
              setEnabled((m) => ({ ...m, [id]: v }));
              toast("Workflow updated");
            }}
            onDelete={(id) => {
              setDeleted((d) => [...d, id]);
              toast("Workflow successfully deleted.");
            }}
          />
        </div>
      </Centered>
    </PageContent>
  );
}
