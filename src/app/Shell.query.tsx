import { useEffect, type ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ShellContext } from "../components/domain/shell-context";
import { useProject, useProjectList } from "../api/projects";
import { fixtureProject } from "../fixtures/projects";
import { currentInstance, currentUser, currentUserIsSuperuser } from "../fixtures/user";
import { asProject, isOpenable } from "../pages/project-records.query";
import { useSandbox, useSavedSandboxes } from "./sandbox-state";
import { noteOpened, useRecentProjectIds } from "./recent-projects";
import { useFlags } from "./feature-flags";

/**
 * Feeds the app's chrome from the API: the project the URL is inside, under
 * its current name, and your recently opened projects, keeping only those
 * you can still open. Who you are, the instance and the selected sandbox
 * still come from fixtures and app state.
 */
export default function ShellQuery({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const projectId = pathname.match(/^\/projects\/([^/]+)/)?.[1];
  const { project: details } = useProject(projectId);
  const { projects } = useProjectList();
  const recentIds = useRecentProjectIds();

  useEffect(() => {
    if (details && !details.scheduledDeletion) noteOpened(details.id);
  }, [details]);

  // Sandboxes haven't moved to the API yet: they're still kept per fixture project.
  const sandboxKey = fixtureProject(details?.id)?.id ?? details?.id ?? "";
  const [sandbox, setSandbox] = useSandbox(sandboxKey);
  const savedSandboxes = useSavedSandboxes(sandboxKey);
  const project = details && { ...asProject(details), ...(savedSandboxes && { sandboxes: savedSandboxes.map((s) => s.name) }) };

  const openable = projects.filter(isOpenable);
  const recentProjects = [
    ...recentIds.flatMap((id) => openable.filter((p) => p.id === id)),
    ...openable.filter((p) => !recentIds.includes(p.id)),
  ].map(asProject);

  return (
    <ShellContext.Provider
      value={{
        currentPath: pathname,
        instance: currentInstance,
        user: currentUser,
        recentProjects,
        project,
        sandbox,
        onSelectSandbox: setSandbox,
        onNavigate: (path) => navigate(path),
        flags: useFlags(),
        isSuperuser: currentUserIsSuperuser,
      }}
    >
      {children}
    </ShellContext.Provider>
  );
}
