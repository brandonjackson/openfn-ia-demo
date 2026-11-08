import { useNavigate } from "react-router-dom";
import type { PageRoute } from "../../app/ia-utils";
import Loaded from "../../app/Loaded";
import { useProject } from "../../api/projects";
import { useProjectServices, useServiceSaves, type ServiceRecord } from "../../api/services";
import { useProjectWorkflows } from "../../api/workflows";
import { combine } from "../../api/status";
import type { ProjectDetails } from "../../model/projects";
import type { ServiceApiSpec } from "../../model/services";
import type { WorkflowDocument } from "../../model/workflow-document";
import { useOrganizationXRoad } from "../../api/organization";
import type { XRoadIdentity } from "../../model/xroad";
import { useFlags } from "../../app/feature-flags";
import ServicePage, { type ServicePageData } from "./ServicePage";
import NotFoundPage from "../NotFoundPage";
import { pageFrame } from "../../app/page-frame";

/**
 * Build a published service's catalog entry. Services without a written-up
 * API get a default webhook spec, so every service has something to show.
 * Without the organisation's X-Road identity (the flag off), it isn't on X-Road.
 */
function buildServiceData(project: ProjectDetails, service: ServiceRecord, workflows: WorkflowDocument[], xroad: XRoadIdentity | undefined): ServicePageData {
  const workflow = workflows.find((w) => w.id === service.workflowId);
  const defaultApi: ServiceApiSpec = {
    trigger: "webhook",
    invocation: `POST https://app.openfn.org/i/${project.name}/${service.code}`,
    auth: "API key in the x-api-key header",
    outputDescription: "Returns the work order ID; the workflow runs in the background.",
    outputExample: `{\n  "workOrderId": "wo_…",\n  "status": "accepted"\n}`,
  };

  return {
    projectId: project.id,
    projectName: project.name,
    service,
    workflow: workflow && { id: workflow.id, name: workflow.name },
    // Off X-Road, a service is called with an API key only.
    api: xroad ? (service.api ?? defaultApi) : { ...(service.api ?? defaultApi), auth: defaultApi.auth },
    xroadOrg: xroad,
  };
}

/**
 * Feeds a published service's page from the demo's own services routes:
 * turning MCP on and publishing to X-Road save there, so the catalog shows
 * them too. The organisation's X-Road identity comes from its own route, and
 * the page waits for it (without X-Road there's none to wait for). An old link
 * by a fixture service's slug is sent on by the route table.
 */
export default function ServicePageQuery({ route }: { route: PageRoute }) {
  const navigate = useNavigate();
  const flags = useFlags();
  const projectId = route.params["project"];
  const serviceId = route.params["service"] ?? "";
  const { status: projectStatus, project } = useProject(projectId);
  const { status, services } = useProjectServices(projectId);
  const { status: workflowsStatus, workflows } = useProjectWorkflows(projectId);
  const { status: xroadStatus, xroad } = useOrganizationXRoad(flags.xroad);
  const saves = useServiceSaves();
  return (
    <Loaded status={combine(projectStatus, status, workflowsStatus, xroadStatus)} path={route.currentPath}>
      {() => {
        const service = services.find((s) => s.id === serviceId);
        if (!service) return <NotFoundPage path={route.currentPath} reason="data" />;
        const data = buildServiceData(project!, service, workflows, xroad);
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
