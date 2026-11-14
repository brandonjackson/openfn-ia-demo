import { useEffect, type ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ShellContext } from "../components/domain/shell-context";
import { useProject, useProjectList } from "../api/projects";
import { useMergePreview, useSandboxComponentChanges, useSandboxes } from "../api/workflows";
import { useInstance, useMe } from "../api/account";
import { asProject, isOpenable } from "../model/projects";
import { sandboxNames } from "../model/sandboxes";
import { componentChanges, previewChanges } from "../model/workflow-changes";
import { instanceInitials, instanceName } from "../model/account";
import { setSandbox as setSandboxOf, useSandbox } from "./sandbox-state";
import { noteOpened, useRecentProjectIds } from "./recent-projects";
import { useFlags } from "./feature-flags";

/**
 * Feeds the app's chrome from the API: the instance, who you are and whether
 * you're a superuser, the project the URL is inside, under its current name,
 * and your recently opened projects, keeping only those you can still open.
 * Each is left out (the instance's name blank) until it's loaded, and the
 * chrome draws what it has. The
 * selected sandbox is app state.
 */
export default function ShellQuery({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const projectId = pathname.match(/^\/projects\/([^/]+)/)?.[1];
  const { project: details } = useProject(projectId);
  const { projects } = useProjectList();
  const recentIds = useRecentProjectIds();
  // You and the instance, from the API, so a change to your profile shows in the account menu.
  const { status: meStatus, me } = useMe();
  const { status: instanceStatus, instance } = useInstance();
  // Lightning sends no name, so it goes by its URL's host; by the page's own host if it couldn't be loaded.
  const name =
    instanceStatus.state === "loading" ? "" : instanceName(instance?.name, instance?.url ?? window.location.origin);

  useEffect(() => {
    if (details && !details.scheduledDeletion) noteOpened(details.id);
  }, [details]);

  // The selected sandbox is kept by the app, per project, by its id.
  const [selected, setSandbox] = useSandbox(details?.id ?? "");
  const { sandboxes } = useSandboxes(details?.id);
  const names = sandboxNames(sandboxes);
  // A sandbox that's gone (deleted, or never made) leaves you on main.
  const sandbox = names.includes(selected) ? selected : "main";
  const project = details && asProject(details, names);
  // What the selected sandbox would bring back to its parent, for the sandbox chip: its new and changed
  // workflows, components and environment variables, from the merge preview.
  const current = sandbox === "main" ? undefined : sandboxes.find((s) => s.name === sandbox && !s.scheduledDeletion);
  const parentId = current?.parentId ?? undefined;
  const { workflows: changedWorkflows } = useMergePreview(parentId ?? "", current?.id, parentId);
  const { changes: changedComponents } = useSandboxComponentChanges(parentId, current?.id, "");
  const sandboxChanges = current ? [...previewChanges(changedWorkflows), ...componentChanges(changedComponents)] : [];
  const sandboxTarget = parentId === details?.id ? "main" : sandboxes.find((s) => s.id === parentId)?.name;

  const openable = projects.filter(isOpenable);
  const recentProjects = [
    ...recentIds.flatMap((id) => openable.filter((p) => p.id === id)),
    ...openable.filter((p) => !recentIds.includes(p.id)),
  ].map((p) => asProject(p));

  return (
    <ShellContext.Provider
      value={{
        currentPath: pathname,
        instance: { name, initials: instanceInitials(name) },
        user: me,
        recentProjects,
        project,
        sandbox,
        onSelectSandbox: setSandbox,
        sandboxChanges,
        sandboxTarget,
        // Another project opens on main, whichever sandbox you were last in there.
        onSwitchProject: (id, path) => {
          setSandboxOf(id, "main");
          navigate(path);
        },
        onNavigate: (path) => navigate(path),
        flags: useFlags(),
        // Unknown while you load or if you couldn't be; refused outright, you're not one.
        isSuperuser: me ? me.isSuperuser : meStatus.state === "notFound" || meStatus.state === "forbidden" ? false : undefined,
        ...(meStatus.state === "error" && { userError: meStatus.message }),
      }}
    >
      {children}
    </ShellContext.Provider>
  );
}
