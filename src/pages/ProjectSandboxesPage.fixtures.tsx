import type { PageRoute } from "../app/ia-utils";
import { saveSandboxes, useSandbox, useSavedSandboxes } from "../app/sandbox-state";
import type { SandboxItem } from "../model/page-data";
import { sandboxSlug } from "../model/sandboxes";
import { projectSandboxes } from "../fixtures/projects";
import { currentUser } from "../fixtures/user";
import ProjectSandboxesPage from "./ProjectSandboxesPage";
import NotFoundPage from "./NotFoundPage";
import { pageFrame, routeProject } from "./route.fixtures";

/** `name` and every sandbox made from it, and from those. */
function withDescendants(name: string, sandboxes: SandboxItem[]): string[] {
  return [name, ...sandboxes.filter((s) => s.parent === name).flatMap((s) => withDescendants(s.name, sandboxes))];
}

/**
 * Feeds a project's Sandboxes page from fixtures and the sandbox store,
 * which keeps sandboxes made, changed and deleted this session so the
 * project bar and the editor see them too.
 */
export default function ProjectSandboxesPageFixtures({ route }: { route: PageRoute }) {
  const project = routeProject(route);
  const [selected, setSelected] = useSandbox(project?.id ?? "");
  const saved = useSavedSandboxes(project?.id ?? "");
  if (!project) return <NotFoundPage path={route.currentPath} reason="data" />;
  const sandboxes = saved ?? projectSandboxes(project);
  const save = (next: SandboxItem[]) => saveSandboxes(project.id, next);

  return (
    <ProjectSandboxesPage
      {...pageFrame(route)}
      data={{ pageType: "project-sandboxes", projectId: project.id, sandboxes }}
      selectedSandbox={selected}
      onSelectSandbox={setSelected}
      onCreateSandbox={async ({ name, color, parent }) => {
        const slug = sandboxSlug(name);
        save([
          ...sandboxes,
          {
            name: slug,
            isMain: false,
            description: "",
            createdBy: `${currentUser.firstName} ${currentUser.lastName}`,
            lastActivity: "just now",
            color,
            parent,
            changes: [],
            credentials: [],
          },
        ]);
        // As in Lightning, you go straight into the sandbox you made.
        setSelected(slug);
      }}
      onEditSandbox={async (oldName, { name, color }) => {
        const slug = sandboxSlug(name);
        save(
          sandboxes.map((s) =>
            s.name === oldName ? { ...s, name: slug, color } : s.parent === oldName ? { ...s, parent: slug } : s
          )
        );
        if (selected === oldName) setSelected(slug);
      }}
      onMergeSandbox={async (name, merge) => {
        save(
          sandboxes.map((s) =>
            s.name === name
              ? {
                  ...s,
                  changes: s.changes.filter((c) => !merge.workflowIds.includes(c.workflowId)),
                  credentials: s.credentials.filter((c) => !merge.credentials.includes(c)),
                }
              : s.name === merge.target
                ? { ...s, lastActivity: "just now" }
                : s
          )
        );
      }}
      onDeleteSandbox={async (name) => {
        // Deleting a sandbox deletes the ones made from it too.
        const gone = withDescendants(name, sandboxes);
        save(sandboxes.filter((s) => !gone.includes(s.name)));
      }}
    />
  );
}
