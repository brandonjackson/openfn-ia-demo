import type { PageRoute } from "../app/ia-utils";
import Loaded from "../app/Loaded";
import { useSandbox } from "../app/sandbox-state";
import { useProject, useProjectList } from "../api/projects";
import { useSandboxChanges, useSandboxes, useSandboxSaves } from "../api/workflows";
import { combine } from "../api/status";
import type { SandboxItem } from "../model/page-data";
import type { ProjectDetails } from "../model/projects";
import { sandboxColorHex, sandboxColorName, sandboxSlug } from "../model/sandboxes";
import { timeAgo } from "../model/time";
import { fixtureProject } from "../fixtures/projects";
import ProjectSandboxesPage from "./ProjectSandboxesPage";
import { pageFrame } from "../app/page-frame";

/**
 * Feeds a project's Sandboxes page from the API. Each sandbox is a project
 * made from main (or from another sandbox); what it has changed is what a
 * merge into its parent would bring. Making one copies every workflow,
 * renaming or recolouring saves the sandbox, merging copies its changed
 * workflows into the target as new versions, and deleting takes the
 * sandboxes made from it too. The selected sandbox is still kept by the
 * app, shared with the project bar and the editor.
 */
export default function ProjectSandboxesPageQuery({ route }: { route: PageRoute }) {
  const rootId = route.params["project"];
  const { status: rootStatus, project: root } = useProject(rootId);
  // The list carries a project's owner and last activity; its own GET doesn't.
  const { projects } = useProjectList();
  const listed = projects.find((p) => p.id === rootId);
  const { status: sandboxStatus, sandboxes } = useSandboxes(rootId);
  const live = sandboxes.filter((s) => !s.scheduledDeletion);
  const { status: changesStatus, changes } = useSandboxChanges(rootId, live);
  const saves = useSandboxSaves();
  const [selected, setSelected] = useSandbox(fixtureProject(rootId)?.id ?? rootId ?? "");

  const byName = (name: string) => (name === "main" ? root : live.find((s) => s.name === name));
  const nameOf = (id: string | null) => (id === root?.id ? "main" : live.find((s) => s.id === id)?.name);
  const item = (s: ProjectDetails): SandboxItem => ({
    name: s.name,
    isMain: false,
    description: s.description,
    createdBy: s.owner ? `${s.owner.firstName} ${s.owner.lastName}` : "Unknown",
    lastActivity: timeAgo(s.lastActivity ?? s.createdAt),
    color: sandboxColorName(s.color),
    parent: nameOf(s.parentId),
    changes: (changes[s.id] ?? []).map((c) => ({ workflowId: c.sourceWorkflowId!, workflowName: c.name, diverged: c.diverged })),
    // Credentials only the sandbox has: none until credentials move to the API.
    credentials: [],
  });

  return (
    <Loaded status={combine(rootStatus, sandboxStatus, changesStatus)} path={route.currentPath}>
      {() => (
        <ProjectSandboxesPage
          {...pageFrame(route, {}, root!.name)}
          data={{
            pageType: "project-sandboxes",
            projectId: root!.id,
            sandboxes: [
              {
                name: "main",
                isMain: true,
                description: "The live version of this project. Sandboxes merge back into main.",
                createdBy: listed?.owner ? `${listed.owner.firstName} ${listed.owner.lastName}` : "Project owner",
                lastActivity: timeAgo(listed?.lastActivity ?? root!.createdAt),
                color: "gray",
                changes: [],
                credentials: [],
              },
              ...live.map(item),
            ],
          }}
          selectedSandbox={live.some((s) => s.name === selected) ? selected : "main"}
          onSelectSandbox={setSelected}
          onCreateSandbox={async ({ name, color, parent }) => {
            const slug = sandboxSlug(name);
            await saves.create(byName(parent ?? "main")!.id, { name: slug, color: sandboxColorHex[color] });
            // As in Lightning, you go straight into the sandbox you made.
            setSelected(slug);
          }}
          onEditSandbox={async (oldName, { name, color }) => {
            const sandbox = byName(oldName)!;
            const slug = sandboxSlug(name);
            await saves.update(sandbox.id, { name: slug, description: sandbox.description, color: sandboxColorHex[color] });
            if (selected === oldName) setSelected(slug);
          }}
          onMergeSandbox={async (name, merge) => {
            const sandbox = byName(name)!;
            await saves.merge(sandbox.parentId!, sandbox.id, { targetId: byName(merge.target)!.id, workflowIds: merge.workflowIds });
          }}
          onDeleteSandbox={async (name) => {
            await saves.remove(byName(name)!.id);
            // A deleted sandbox can't stay selected.
            if (selected === name) setSelected("main");
          }}
        />
      )}
    </Loaded>
  );
}
