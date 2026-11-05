import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { PageRoute } from "../app/ia-utils";
import type { ProjectServiceItem, ServiceApiSpec, ServicePageData } from "../model/page-data";
import { projects } from "../fixtures/projects";
import { orgXRoad } from "../fixtures/xroad";
import { useFlags } from "../app/feature-flags";
import ServicePage from "./ServicePage";
import NotFoundPage from "./NotFoundPage";
import { pageFrame, routeProject } from "./route.fixtures";

/**
 * Build a published service's catalog entry. Services without a written-up
 * API get a default webhook spec, so every service has something to show.
 * Without the X-Road flag, the organisation isn't on X-Road.
 */
function buildServiceData(projectId: string, serviceId: string, xroad: boolean): ServicePageData | undefined {
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
    // Off X-Road, a service is called with an API key only.
    api: xroad ? (service.api ?? defaultApi) : { ...(service.api ?? defaultApi), auth: defaultApi.auth },
    xroadOrg: xroad ? orgXRoad : undefined,
  };
}

/** Feeds a published service's page from fixtures. */
export default function ServicePageFixtures({ route }: { route: PageRoute }) {
  const navigate = useNavigate();
  // Changes saved this session, by service: the fixtures' stand-in for the server.
  const [saved, setSaved] = useState<Record<string, Partial<ProjectServiceItem>>>({});
  const flags = useFlags();
  const project = routeProject(route);
  const found = project && buildServiceData(project.id, route.params["service"], flags.xroad);
  if (!found) return <NotFoundPage path={route.currentPath} reason="data" />;

  const data = { ...found, service: { ...found.service, ...saved[found.service.id] } };
  const save = (changes: Partial<ProjectServiceItem>) =>
    setSaved((s) => ({ ...s, [data.service.id]: { ...s[data.service.id], ...changes } }));

  return (
    <ServicePage
      {...pageFrame(route, { label: data.service.name })}
      data={data}
      onOpenProject={() => navigate(`/projects/${data.projectId}`)}
      onOpenWorkflow={(id) => navigate(`/workflow-editor/${id}`)}
      onEnableMcp={async () => save({ mcpEnabled: true })}
      onPublishToXRoad={async () =>
        save({
          xroad: {
            ...data.service.xroad,
            serviceCode: data.service.xroad?.serviceCode ?? data.service.id,
            published: true,
          },
        })
      }
    />
  );
}
