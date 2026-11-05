import type { ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ShellContext } from "../components/domain/shell-context";
import { projects, recentProjects } from "../fixtures/projects";
import { currentInstance, currentUser, currentUserIsSuperuser } from "../fixtures/user";
import { useSandbox } from "./sandbox-state";
import { useFlags } from "./feature-flags";
import type { FeatureFlags } from "../model/feature-flags";

/**
 * Feeds the app's chrome from fixtures and the router: who you are, which
 * instance, your recent projects, the project the URL is inside, its
 * selected sandbox, the feature flags in effect and whether you're a superuser. The shell's equivalent of a page's wrapper.
 */
export default function ShellFixtures({
  children,
  flags: override,
}: {
  children: ReactNode;
  /** Flags to use instead of the flag store's, for stories. */
  flags?: FeatureFlags;
}) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const match = pathname.match(/^\/projects\/([^/]+)/);
  const fixtureProject = match ? projects.find((p) => p.id === match[1]) : undefined;
  const [sandbox, setSandbox] = useSandbox(fixtureProject?.id ?? "");
  const project = fixtureProject;
  const stored = useFlags();
  const flags = override ?? stored;

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
        isSuperuser: currentUserIsSuperuser,
      }}
    >
      {children}
    </ShellContext.Provider>
  );
}
