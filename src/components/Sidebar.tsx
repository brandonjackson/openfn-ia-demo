import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { cn } from "../utils/cn";
import { currentUser, instanceAdminEmail, releaseLabel } from "../mock-data/users";
import type { Project } from "../mock-data/projects";
import NavItem from "./NavItem";
import UserMenu from "./UserMenu";
import { OpenFnLogo, OpenFnLogoCollapsed } from "./OpenFnLogo";

/** Which menu the side bar shows: the project's, your own pages, or the admin menu. */
export type SidebarVariant = "project" | "profile" | "admin";

interface Props {
  variant: SidebarVariant;
  /** Required for the project variant. */
  project?: Project;
  collapsed: boolean;
  onToggle: () => void;
}

function isAt(pathname: string, path: string) {
  return pathname === path || pathname.startsWith(path + "/");
}

function ProjectItems({ project }: { project: Project }) {
  const { pathname } = useLocation();
  const base = `/projects/${project.id}`;
  return (
    <>
      <NavItem to={`${base}/w`} icon="hero-square-3-stack-3d" label="Workflows" active={isAt(pathname, `${base}/w`)} />
      {currentUser.experimentalFeatures && (
        <NavItem
          to={`${base}/channels`}
          icon="hero-arrows-right-left"
          label="Channels"
          active={isAt(pathname, `${base}/channels`)}
        />
      )}
      <NavItem to={`${base}/sandboxes`} icon="hero-beaker" label="Sandboxes" active={isAt(pathname, `${base}/sandboxes`)} />
      <NavItem
        to={`${base}/history`}
        icon="hero-rectangle-stack"
        label="History"
        active={["history", "runs", "dataclips"].some((s) => isAt(pathname, `${base}/${s}`))}
      />
      <NavItem to={`${base}/settings`} icon="hero-cog-8-tooth" label="Settings" active={isAt(pathname, `${base}/settings`)} />
    </>
  );
}

function ProfileItems() {
  const { pathname } = useLocation();
  return (
    <>
      <NavItem to="/projects" icon="hero-folder" label="Projects" active={pathname === "/projects"} />
      <NavItem to="/profile" icon="hero-user-circle" label="User Profile" active={pathname === "/profile"} />
      <NavItem to="/credentials" icon="hero-key" label="Credentials" active={isAt(pathname, "/credentials")} />
      <NavItem to="/profile/tokens" icon="hero-command-line" label="API Tokens" active={isAt(pathname, "/profile/tokens")} />
    </>
  );
}

function AdminItems() {
  const { pathname } = useLocation();
  return (
    <>
      <div className="mt-4" />
      <NavItem to="/settings/projects" icon="hero-building-library" label="Projects" active={isAt(pathname, "/settings/projects")} />
      <NavItem to="/settings/users" icon="hero-user-group" label="Users" active={isAt(pathname, "/settings/users")} />
      <NavItem
        to="/settings/authentication/new"
        icon="hero-key"
        label="Authentication"
        active={isAt(pathname, "/settings/authentication")}
      />
      <NavItem to="/settings/audit" icon="hero-archive-box" label="Audit" active={isAt(pathname, "/settings/audit")} />
      <NavItem
        to="/settings/collections"
        icon="hero-circle-stack"
        label="Collections"
        active={isAt(pathname, "/settings/collections")}
      />
      <NavItem
        to="/settings/maintenance"
        icon="hero-wrench-screwdriver"
        label="Maintenance"
        active={isAt(pathname, "/settings/maintenance")}
      />
      <div className="grow" />
      <NavItem to="/projects" icon="hero-arrow-left" label="Back" />
    </>
  );
}

/** Support links for regular users; superusers get the Admin menu instead. */
function FooterItems() {
  if (currentUser.role === "superuser") {
    return (
      <>
        <NavItem to="/settings/projects" icon="hero-cog-6-tooth" label="Admin Menu" />
        <NavItem to="/dashboard" icon="hero-exclamation-triangle" label="Sys Info" />
      </>
    );
  }
  return (
    <>
      <NavItem href="https://docs.openfn.org" icon="hero-book-open-mini" label="Documentation" />
      <NavItem href="https://community.openfn.org" icon="hero-user-group-mini" label="Community" />
      <NavItem
        href={`mailto:${instanceAdminEmail}`}
        target="_self"
        icon="hero-lifebuoy-mini"
        label="Support"
        title={instanceAdminEmail}
      />
    </>
  );
}

/**
 * Lightning's side menu (layouts/live.html.heex and settings.html.heex): the
 * user menu in a dark h-20 bar, the menu items for where you are, support or
 * admin links pinned low, then the OpenFn logo, version and collapse toggle.
 * Ctrl+M collapses it, as in Lightning.
 */
export default function Sidebar({ variant, project, collapsed, onToggle }: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key.toLowerCase() === "m") {
        e.preventDefault();
        onToggle();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onToggle]);

  const theme = variant === "admin" ? "sudo-variant" : "primary-theme";

  return (
    <>
      {/* Placeholder keeps the content column from sliding under the fixed panel. */}
      <div className={cn("flex-shrink-0 transition-[width] duration-200", collapsed ? "w-16" : "w-48")} />
      <div
        id="sidebar-panel"
        data-ui="sidebar"
        data-collapsed={String(collapsed)}
        className={cn("flex flex-col h-full z-[100] transition-[width] duration-200 fixed", theme)}
      >
        <div className={cn("app-logo-container h-20 flex items-center", theme)}>
          <UserMenu user={currentUser} />
        </div>
        <nav id="side-menu" className={cn("flex-1 overflow-hidden", theme)}>
          <div className="flex flex-col h-full">
            <div className={cn("flex-1 overflow-y-auto min-h-0 flex flex-col", variant !== "admin" && "py-4")}>
              {variant === "admin" ? (
                <AdminItems />
              ) : (
                <>
                  {variant === "project" && project ? <ProjectItems project={project} /> : <ProfileItems />}
                  <div className="grow" />
                  <FooterItems />
                </>
              )}
            </div>
            {currentUser.experimentalFeatures && (
              <div className="flex-shrink-0 border-t border-white/10 mt-3 pt-3">
                <div className="mx-3">
                  <div
                    title="You're using features that are still being built. Things may work differently for you than for your teammates."
                    className="menu-item h-8 rounded-lg text-sm font-medium inline-flex items-center text-amber-300"
                  >
                    <span className="hero-wrench-screwdriver h-5 w-5 shrink-0" />
                    <span className="menu-item-text truncate">Experimental</span>
                  </div>
                </div>
              </div>
            )}
            <div className="flex-shrink-0 flex flex-col border-t border-white/10 pt-3 mt-3">
              <div className="h-14 text-center">
                <div className="pt-2">
                  {collapsed ? (
                    <OpenFnLogoCollapsed className="h-6 primary-light mx-auto" />
                  ) : (
                    <OpenFnLogo className="h-6 primary-light mx-auto" />
                  )}
                </div>
                <div className="text-[8px] primary-light opacity-50 flex justify-center">
                  <code className="py-1 rounded-md break-keep primary-light inline-block align-middle text-center">
                    {releaseLabel}
                  </code>
                </div>
              </div>
              <div className="border-t border-white/10 mt-2">
                <button
                  type="button"
                  onClick={onToggle}
                  className="sidebar-toggle-btn w-full py-1.5 focus:outline-none cursor-pointer hover:bg-white/5 transition-colors"
                  title="Toggle sidebar"
                  aria-label="Toggle sidebar"
                >
                  <div className="mx-3 flex items-center h-5 pl-3">
                    <svg className="w-5 h-5 text-white/70" viewBox="0 0 18 18" fill="currentColor" aria-hidden="true">
                      {collapsed ? (
                        <path
                          fillRule="evenodd"
                          d="M12.54 9.154l-3.444 3.442 1.058 1.058 4.5-4.5-4.5-4.5-1.058 1.057 3.444 3.443zm-7.194-4.5v9h1.5v-9h-1.5z"
                        />
                      ) : (
                        <path
                          fillRule="evenodd"
                          d="M5.46 8.846l3.444-3.442-1.058-1.058-4.5 4.5 4.5 4.5 1.058-1.057L5.46 8.84zm7.194 4.5v-9h-1.5v9h1.5z"
                        />
                      )}
                    </svg>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </nav>
      </div>
    </>
  );
}
