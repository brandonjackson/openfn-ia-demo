import { useEffect, type ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ShellContext } from "../components/domain/shell-context";
import { useProject, useProjectList } from "../api/projects";
import { useSandboxes } from "../api/workflows";
import { useInstance, useMe } from "../api/account";
import { asProject } from "../pages/project-records.query";
import { isOpenable } from "../model/projects";
import { instanceInitials } from "../model/account";
import { useSandbox } from "./sandbox-state";
import { noteOpened, useRecentProjectIds } from "./recent-projects";
import { useFlags } from "./feature-flags";

/**
 * Feeds the app's chrome from the API: the instance, who you are and whether
 * you're a superuser, the project the URL is inside, under its current name,
 * and your recently opened projects, keeping only those you can still open.
 * Each is left out until it's loaded, and the chrome draws what it has. The
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
  const { instance } = useInstance();

  useEffect(() => {
    if (details && !details.scheduledDeletion) noteOpened(details.id);
  }, [details]);

  // The selected sandbox is kept by the app, per project, by its id.
  const [selected, setSandbox] = useSandbox(details?.id ?? "");
  const { sandboxes } = useSandboxes(details?.id);
  const live = sandboxes.filter((s) => !s.scheduledDeletion).map((s) => s.name);
  // A sandbox that's gone (deleted, or never made) leaves you on main.
  const sandbox = live.includes(selected) ? selected : "main";
  const project = details && { ...asProject(details), sandboxes: ["main", ...live] };

  const openable = projects.filter(isOpenable);
  const recentProjects = [
    ...recentIds.flatMap((id) => openable.filter((p) => p.id === id)),
    ...openable.filter((p) => !recentIds.includes(p.id)),
  ].map(asProject);

  return (
    <ShellContext.Provider
      value={{
        currentPath: pathname,
        instance: instance && { name: instance.name, initials: instanceInitials(instance.name) },
        user: me,
        recentProjects,
        project,
        sandbox,
        onSelectSandbox: setSandbox,
        onNavigate: (path) => navigate(path),
        flags: useFlags(),
        // Not a superuser if you couldn't be loaded: Admin settings say Not Found rather than wait.
        isSuperuser: me ? me.isSuperuser : meStatus.state === "loading" ? undefined : false,
      }}
    >
      {children}
    </ShellContext.Provider>
  );
}
