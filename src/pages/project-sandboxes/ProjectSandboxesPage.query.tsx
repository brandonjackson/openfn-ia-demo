import type { PageRoute } from "../../app/ia-utils";
import Loaded from "../../app/Loaded";
import { useSandbox } from "../../app/sandbox-state";
import { useProject, useProjectList } from "../../api/projects";
import { useSandboxChanges, useSandboxes, useSandboxSaves } from "../../api/workflows";
import { combine } from "../../api/status";
import { type SandboxItem, sandboxSlug } from "../../model/sandboxes";
import { fileChanges, previewChanges } from "../../model/workflow-changes";
import type { ProjectDetails } from "../../model/projects";
import ProjectSandboxesPage from "./ProjectSandboxesPage";
import { pageFrame } from "../../app/page-frame";
import { useAnnounceOutcome } from "../../app/announce";

/**
 * Feeds a project's Sandboxes page from the API. Each sandbox is a project
 * made from main (or from another sandbox); what it has changed is what a
 * merge into its parent would bring, workflows, components and environment
 * variables alike. Making one copies every workflow, editing saves its name
 * and environment, promoting merges its changes into its parent as new
 * versions, and deleting takes the sandboxes made from it too. The selected sandbox is still kept by the
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
  const [selected, setSelected] = useSandbox(rootId ?? "");
  const announcing = useAnnounceOutcome();

  const byName = (name: string) => (name === "main" ? root : live.find((s) => s.name === name));
  const nameOf = (id: string | null) => (id === root?.id ? "main" : live.find((s) => s.id === id)?.name);
  const item = (s: ProjectDetails): SandboxItem => ({
    name: s.name,
    isMain: false,
    createdBy: s.owner ? `${s.owner.firstName} ${s.owner.lastName}` : "Unknown",
    lastActivity: s.lastActivity ?? s.createdAt,
    env: s.env,
    parent: nameOf(s.parentId),
    // As the sandbox chip counts them: its workflows, then its files.
    changes: [...previewChanges(changes[s.id]?.workflows ?? []), ...fileChanges(changes[s.id]?.files ?? [])],
  });

  return (
    <Loaded status={combine(rootStatus, sandboxStatus, changesStatus)} path={route.currentPath}>
      {() => (
        <ProjectSandboxesPage
          {...pageFrame(route, {}, root!.name)}
          data={{
            sandboxes: [
              {
                name: "main",
                isMain: true,
                createdBy: listed?.owner ? `${listed.owner.firstName} ${listed.owner.lastName}` : "Project owner",
                lastActivity: listed?.lastActivity ?? root!.createdAt,
                env: root!.env,
                changes: [],
              },
              ...live.map(item),
            ],
          }}
          selectedSandbox={live.some((s) => s.name === selected) ? selected : "main"}
          onSelectSandbox={setSelected}
          onCreateSandbox={async ({ name, env, parent }) => {
            const slug = sandboxSlug(name);
            // A refusal shows under the form's fields, so only success is announced.
            await announcing(saves.create(byName(parent ?? "main")!.id, { name: slug, color: null, env }), {
              success: `Created ${slug} from ${parent ?? "main"}.`,
            });
            // As in Lightning, you go straight into the sandbox you made.
            setSelected(slug);
          }}
          onEditSandbox={async (oldName, { name, env }) => {
            const sandbox = byName(oldName)!;
            const slug = sandboxSlug(name);
            // The colour Lightning stores is kept as it is: nothing here sets it any more.
            await announcing(saves.update(sandbox.id, { name: slug, description: sandbox.description, color: sandbox.color, env }), {
              success: `Saved ${slug}.`,
            });
            if (selected === oldName) setSelected(slug);
          }}
          onPromoteSandbox={async (name, message) => {
            const sandbox = byName(name)!;
            const parent = nameOf(sandbox.parentId) ?? "main";
            await announcing(saves.merge(sandbox.parentId!, sandbox.id, { targetId: sandbox.parentId!, message }), {
              success: `Promoted ${name} into ${parent}. You can delete the sandbox once you're done with it.`,
            });
          }}
          onDeleteSandbox={async (name) => {
            await announcing(saves.remove(byName(name)!.id), { success: `Deleted ${name}.`, failure: `${name} wasn't deleted` });
            // A deleted sandbox can't stay selected.
            if (selected === name) setSelected("main");
          }}
        />
      )}
    </Loaded>
  );
}
