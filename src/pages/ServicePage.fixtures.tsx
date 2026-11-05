import type { PageRoute } from "../app/ia-utils";
import type { ServiceApiSpec, ServicePageData } from "../model/page-data";
import { projects } from "../fixtures/projects";
import ServicePage from "./ServicePage";
import NotFoundPage from "./NotFoundPage";
import { pageFrame, routeProject } from "./route.fixtures";

/**
 * Build a published service's catalog entry. Services without a written-up
 * API get a default webhook spec, so every service has something to show.
 */
function buildServiceData(projectId: string, serviceId: string): ServicePageData | undefined {
  const project = projects.find((p) => p.id === projectId);
  const service = project?.services.find((s) => s.id === serviceId);
  if (!project || !service) return undefined;

  const defaultApi: ServiceApiSpec = {
    trigger: "webhook",
    invocation: `POST https://app.openfn.org/i/${project.id}/${service.id}`,
    auth: "API key in the x-api-key header",
    outputDescription: "Returns the work order ID; the workflow runs in the background.",
    outputExample: `{\n  "workOrderId": "wo_…",\n  "status": "accepted"\n}`,
  };

  return {
    pageType: "service",
    projectId: project.id,
    projectName: project.name,
    service,
    workflow: project.components.find((c) => c.id === service.workflowId),
    api: service.api ?? defaultApi,
  };
}

/** Feeds a published service's page from fixtures. */
export default function ServicePageFixtures({ route }: { route: PageRoute }) {
  const project = routeProject(route);
  const data = project && buildServiceData(project.id, route.params["service"]);
  if (!data) return <NotFoundPage path={route.currentPath} reason="data" />;
  return <ServicePage {...pageFrame(route, { label: data.service.name })} data={data} />;
}
