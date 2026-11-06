import { useNavigate } from "react-router-dom";
import type { PageRoute } from "../app/ia-utils";
import Loaded from "../app/Loaded";
import { useAllServices, type ServiceRecord } from "../api/services";
import type { CatalogEntry } from "../model/page-data";
import { serviceCatalogData } from "../fixtures/service-catalog";
import { apiProjectId, projectOptions } from "../fixtures/projects";
import ServicesPage from "./ServicesPage";
import { pageFrame } from "../app/page-frame";
import { useFlags } from "../app/feature-flags";

/**
 * A workflow entry as its service now stands on the API: Live or Draft, and
 * callable over MCP or X-Road once it's been turned on there. An entry whose
 * service is gone (its project deleted) leaves the catalog.
 */
function withService(entry: CatalogEntry, services: ServiceRecord[], xroad: boolean): CatalogEntry | undefined {
  if (entry.kind !== "workflow" || !entry.projectPath) return entry;
  const [, , slug, , code] = entry.projectPath.split("/");
  const service = services.find((s) => s.projectId === apiProjectId(slug!) && s.code === code);
  if (!service) return undefined;
  return {
    ...entry,
    name: service.name,
    projectPath: `/projects/${service.projectId}/services/${service.id}`,
    badges: [service.status],
    callableAs: ["workflow", ...(service.mcpEnabled ? (["mcp"] as const) : []), ...(xroad && service.xroad?.published ? (["xroad"] as const) : [])],
  };
}

/** Feeds the Services catalog: the organisation's services from the demo's API, everything else still from fixtures. */
export default function ServicesPageQuery({ route }: { route: PageRoute }) {
  const navigate = useNavigate();
  const flags = useFlags();
  const { status, services } = useAllServices();
  return (
    <Loaded status={status} path={route.currentPath}>
      {() => (
        <ServicesPage
          {...pageFrame(route)}
          data={{
            ...serviceCatalogData,
            entries: serviceCatalogData.entries.flatMap((e) => withService(e, services, flags.xroad) ?? []),
            // Without X-Road, no system is reached through it.
            usedServices: flags.xroad ? serviceCatalogData.usedServices : serviceCatalogData.usedServices?.filter((s) => s.connection !== "xroad"),
            projects: projectOptions,
            connectedSystems: flags.connectedSystems,
            xroad: flags.xroad,
          }}
          onStartWorkflow={(projectId, channelId) => navigate(`/workflow-editor/new?project=${projectId}&channel=${channelId}`)}
        />
      )}
    </Loaded>
  );
}
