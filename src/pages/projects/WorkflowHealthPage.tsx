import { useState } from "react";
import { Navigate, useParams } from "react-router-dom";
import Header from "../../components/Header";
import { Centered, PageContent } from "../../components/PageContent";
import ProjectBreadcrumbs from "../../components/shell/ProjectBreadcrumbs";
import WorkflowHealth from "../../components/projects/health/WorkflowHealth";
import { findProject } from "../../mock-data/projects";
import { findWorkflow } from "../../mock-data/workflows";
import { healthFor } from "../../mock-data/workflow-health";
import { DEFAULT_HEALTH_DAYS } from "../../constants";
import type { HealthRange } from "../../types/workflow-health";

/**
 * Inventory view `workflow-health` (WorkflowLive.Health), which mounts the
 * WorkflowHealth React component under Workflows › name › Health crumbs.
 */
export default function WorkflowHealthPage() {
  const { projectId, workflowId } = useParams();
  const project = findProject(projectId);
  const workflow = findWorkflow(workflowId);
  const [days, setDays] = useState<HealthRange["days"]>(DEFAULT_HEALTH_DAYS);
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
      <Centered className="px-4">
        <div id="workflow-health">
          <WorkflowHealth
            projectId={project.id}
            workflowName={workflow.name}
            days={days}
            onDaysChange={setDays}
            data={healthFor(workflow.id, days)}
            historyRetentionPeriod={project.historyRetentionPeriod}
          />
        </div>
      </Centered>
    </PageContent>
  );
}
