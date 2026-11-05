import { useNavigate } from "react-router-dom";
import type { PageRoute } from "../app/ia-utils";
import { serviceCatalogData } from "../fixtures/service-catalog";
import { projectOptions } from "../fixtures/projects";
import ServicesPage from "./ServicesPage";
import { pageFrame } from "./route.fixtures";

/** Feeds the Services catalog from fixtures. */
export default function ServicesPageFixtures({ route }: { route: PageRoute }) {
  const navigate = useNavigate();
  return (
    <ServicesPage
      {...pageFrame(route)}
      data={{ ...serviceCatalogData, projects: projectOptions }}
      onStartWorkflow={(projectId, channelId) => navigate(`/workflow-editor/new?project=${projectId}&channel=${channelId}`)}
    />
  );
}
