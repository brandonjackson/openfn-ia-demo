import { useNavigate } from "react-router-dom";
import type { PageRoute } from "../app/ia-utils";
import { serviceCatalogData } from "../fixtures/service-catalog";
import { projectOptions } from "../fixtures/projects";
import ServicesPage from "./ServicesPage";
import { pageFrame } from "./route.fixtures";
import { useFlags } from "../app/feature-flags";

/** Feeds the Services catalog from fixtures. */
export default function ServicesPageFixtures({ route }: { route: PageRoute }) {
  const navigate = useNavigate();
  const flags = useFlags();
  return (
    <ServicesPage
      {...pageFrame(route)}
      data={{
        ...serviceCatalogData,
        // Without X-Road, nothing is offered over it and no system is reached through it.
        entries: flags.xroad
          ? serviceCatalogData.entries
          : serviceCatalogData.entries.map((e) =>
              e.kind === "workflow" ? { ...e, callableAs: e.callableAs?.filter((c) => c !== "xroad") } : e
            ),
        usedServices: flags.xroad
          ? serviceCatalogData.usedServices
          : serviceCatalogData.usedServices?.filter((s) => s.connection !== "xroad"),
        projects: projectOptions,
        connectedSystems: flags.connectedSystems,
        xroad: flags.xroad,
      }}
      onStartWorkflow={(projectId, channelId) => navigate(`/workflow-editor/new?project=${projectId}&channel=${channelId}`)}
    />
  );
}
