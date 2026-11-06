import { Navigate, useNavigate } from "react-router-dom";
import type { PageRoute } from "../app/ia-utils";
import Loaded from "../app/Loaded";
import { useProject } from "../api/projects";
import { useProjectServices, useServiceSaves, type ServiceRecord } from "../api/services";
import { useProjectWorkflows } from "../api/workflows";
import { combine } from "../api/status";
import type { ProjectDetails } from "../model/projects";
import type { ServiceApiSpec, ServicePageData } from "../model/page-data";
import type { WorkflowDocument } from "../model/workflow-document";
import { fixtureProject } from "../fixtures/projects";
import { apiServiceId } from "../fixtures/ids";
import { orgXRoad } from "../fixtures/xroad";
import { useFlags } from "../app/feature-flags";
import ServicePage from "./ServicePage";
import NotFoundPage from "./NotFoundPage";
import { pageFrame } from "../app/page-frame";

/**
 * Build a published service's catalog entry. Services without a written-up
 * API get a default webhook spec, so every service has something to show.
 * Without the X-Road flag, the organisation isn't on X-Road.
 */
function buildServiceData(project: ProjectDetails, service: ServiceRecord, workflows: WorkflowDocument[], xroad: boolean): ServicePageData {
  const workflow = workflows.find((w) => w.id === service.workflowId);
  const defaultApi: ServiceApiSpec = {
    trigger: "webhook",
    invocation: `POST https://app.openfn.org/i/${project.name}/${service.code}`,
    auth: "API key in the x-api-key header",
    outputDescription: "Returns the work order ID; the workflow runs in the background.",
    outputExample: `{\n  "workOrderId": "wo_…",\n  "status": "accepted"\n}`,
  };

  return {
    pageType: "service",
    projectId: project.id,
    projectName: project.name,
    service,
    workflow: workflow && { id: workflow.id, name: workflow.name, description: "", type: "Workflow" },
    // Off X-Road, a service is called with an API key only.
    api: xroad ? (service.api ?? defaultApi) : { ...(service.api ?? defaultApi), auth: defaultApi.auth },
    xroadOrg: xroad ? orgXRoad : undefined,
  };
}

/**
 * Feeds a published service's page from the demo's own services routes:
 * turning MCP on and publishing to X-Road save there, so the catalog shows
 * them too. An old link by the service's slug still lands.
 */
export default function ServicePageQuery({ route }: { route: PageRoute }) {
  const navigate = useNavigate();
  const flags = useFlags();
  const projectId = route.params["project"];
  const serviceId = route.params["service"] ?? "";
  const { status: projectStatus, project } = useProject(projectId);
  const { status, services } = useProjectServices(projectId);
  const { status: workflowsStatus, workflows } = useProjectWorkflows(projectId);
  const saves = useServiceSaves();
  const fixture = fixtureProject(projectId);
  if (fixture?.services.some((s) => s.id === serviceId)) return <Navigate to={route.currentPath.replace(serviceId, apiServiceId(fixture.id, serviceId))} replace />;
  return (
    <Loaded status={combine(projectStatus, status, workflowsStatus)} path={route.currentPath}>
      {() => {
        const service = services.find((s) => s.id === serviceId);
        if (!service) return <NotFoundPage path={route.currentPath} reason="data" />;
        const data = buildServiceData(project!, service, workflows, flags.xroad);
        // Owners and admins change a service; everyone else reads it.
        const canChange = !!project!.permissions?.edit_project;
        return (
          <ServicePage
            {...pageFrame(route, { label: service.name }, project!.name)}
            data={data}
            onOpenProject={() => navigate(`/projects/${project!.id}`)}
            onOpenWorkflow={(id) => navigate(`/workflow-editor/${id}`)}
            onEnableMcp={canChange ? () => saves.enableMcp(service) : undefined}
            onPublishToXRoad={canChange ? () => saves.publishToXRoad(service) : undefined}
          />
        );
      }}
    </Loaded>
  );
}
