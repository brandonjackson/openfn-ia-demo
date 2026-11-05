import { useState } from "react";
import type { PageRoute } from "../app/ia-utils";
import { useSandbox } from "../app/sandbox-state";
import { projectSandboxes } from "../fixtures/projects";
import ProjectSandboxesPage from "./ProjectSandboxesPage";
import NotFoundPage from "./NotFoundPage";
import { pageFrame, routeProject } from "./route.fixtures";

/** Feeds a project's Sandboxes page from fixtures and the selected-sandbox store. */
export default function ProjectSandboxesPageFixtures({ route }: { route: PageRoute }) {
  const project = routeProject(route);
  const [selected, setSelected] = useSandbox(project?.id ?? "");
  // Sandboxes deleted this session: the fixtures' stand-in for the server.
  const [deleted, setDeleted] = useState<string[]>([]);
  if (!project) return <NotFoundPage path={route.currentPath} reason="data" />;

  return (
    <ProjectSandboxesPage
      {...pageFrame(route)}
      data={{
        pageType: "project-sandboxes",
        projectId: project.id,
        sandboxes: projectSandboxes(project).filter((s) => !deleted.includes(s.name)),
      }}
      selectedSandbox={selected}
      onSelectSandbox={setSelected}
      onDeleteSandbox={async (name) => setDeleted((d) => [...d, name])}
    />
  );
}
