import type { ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ShellContext } from "../components/patterns/shell-context";
import { projects, recentProjects } from "../fixtures/projects";
import { currentInstance, currentUser } from "../fixtures/user";
import { useSandbox } from "./sandbox-state";
import { useFlags } from "./feature-flags";

/**
 * Feeds the app's chrome from fixtures and the router: who you are, which
 * instance, your recent projects, the project the URL is inside, its
 * selected sandbox and the feature flags in effect. The shell's equivalent of a page's wrapper.
 */
export default function ShellFixtures({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const match = pathname.match(/^\/projects\/([^/]+)/);
  const project = match ? projects.find((p) => p.id === match[1]) : undefined;
  const [sandbox, setSandbox] = useSandbox(project?.id ?? "");
  const flags = useFlags();

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
        flags,
      }}
    >
      {children}
    </ShellContext.Provider>
  );
}
