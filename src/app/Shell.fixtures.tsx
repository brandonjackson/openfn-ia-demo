import type { ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ShellContext } from "../components/patterns/shell-context";
import { projects, recentProjects } from "../fixtures/projects";
import { currentInstance, currentUser } from "../fixtures/user";
import { useSandbox } from "./sandbox-state";
import { useFlags } from "./feature-flags";
import type { FeatureFlags } from "../model/feature-flags";

/**
 * Feeds the app's chrome from fixtures and the router: who you are, which
 * instance, your recent projects, the project the URL is inside, its
 * selected sandbox and the feature flags in effect. The shell's equivalent of a page's wrapper.
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
  const project = match ? projects.find((p) => p.id === match[1]) : undefined;
  const [sandbox, setSandbox] = useSandbox(project?.id ?? "");
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
      }}
    >
      {children}
    </ShellContext.Provider>
  );
}
