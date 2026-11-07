import { createContext, useContext } from "react";
import type { Project } from "../../model/projects";
import type { UserProfile } from "../../model/account";
import { allFlagsOn, type FeatureFlags } from "../../model/feature-flags";

/**
 * What the app's chrome (the sidebar, and the project bar in the
 * breadcrumbs) needs to know, wherever it's drawn. Pages are fed through
 * props; the chrome sits around and above every page, so it's fed once,
 * here, by the shell's wrapper (src/app/Shell.query.tsx; Shell.fixtures.tsx in stories).
 */
export interface Shell {
  /** The URL being shown. */
  currentPath: string;
  /** The instance you're signed in to, for the logo and the account menu; left out until it's loaded. */
  instance?: { name: string; initials: string };
  /** You, for the account menu; left out until you're loaded. */
  user?: UserProfile;
  /** Projects you've opened lately, most recent first: the sidebar's list and the project switcher's shortlist. */
  recentProjects: Project[];
  /** The project the URL is inside, if any. */
  project?: Project;
  /** The sandbox selected in that project. */
  sandbox: string;
  /** Selects a sandbox in that project. */
  onSelectSandbox: (sandbox: string) => void;
  /** Goes to a page in the app, e.g. after switching project. */
  onNavigate: (path: string) => void;
  /** The feature flags in effect, for which menu items to show. */
  flags: FeatureFlags;
  /** Whether you're a superuser, who can reach Admin settings; left out until it's known. */
  isSuperuser?: boolean;
}

const empty: Shell = {
  currentPath: "/",
  recentProjects: [],
  sandbox: "main",
  onSelectSandbox: () => {},
  onNavigate: () => {},
  flags: allFlagsOn,
};

export const ShellContext = createContext<Shell>(empty);

/** The chrome's view of the app. Read it only from chrome (sidebar, crumbs); pages take props. */
export function useShell(): Shell {
  return useContext(ShellContext);
}
