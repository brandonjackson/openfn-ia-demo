import { Navigate, useParams } from "react-router-dom";
import Header from "../../components/Header";
import { PageContent } from "../../components/PageContent";
import ProjectBreadcrumbs from "../../components/ProjectBreadcrumbs";
import WorkflowHealth from "../../components/projects/health/WorkflowHealth";
import { findProject } from "../../mock-data/projects";
import { findWorkflow } from "../../mock-data/workflows";

/**
 * Inventory view `workflow-health` (WorkflowLive.Health), which mounts the
 * WorkflowHealth React component under Workflows › name › Health crumbs.
 */
export default function WorkflowHealthPage() {
  const { projectId, workflowId } = useParams();
  const project = findProject(projectId);
  const workflow = findWorkflow(workflowId);
  if (!project) return <Navigate to="/projects" replace />;
  if (!workflow) return <Navigate to={`/projects/${project.id}/w`} replace />;

  return (
    <PageContent
      header={
        <Header
          breadcrumbs={
            <ProjectBreadcrumbs
              project={project}
              items={[
                ["Workflows", `/projects/${project.id}/w`],
                [workflow.name, `/projects/${project.id}/w/${workflow.id}`],
              ]}
              current="Health"
            />
          }
        />
      }
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div id="workflow-health">
          <WorkflowHealth
            workflowId={workflow.id}
            projectId={project.id}
            workflowName={workflow.name}
            historyRetentionPeriod={project.historyRetentionPeriod}
          />
        </div>
      </div>
    </PageContent>
  );
}
