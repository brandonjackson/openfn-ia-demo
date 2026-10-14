import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { cn } from "../../utils/cn";
import { currentUser, instanceAdminEmail, releaseLabel } from "../../mock-data/users";
import type { Project } from "../../mock-data/projects";
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

  return (
    <>
      {/* Placeholder keeps the content column from sliding under the fixed panel. */}
      <div className={cn("shrink-0 transition-all duration-200", collapsed ? "w-16" : "w-48")} />
      <div
        id="sidebar-panel"
        data-ui="sidebar"
        data-collapsed={String(collapsed)}
        className={cn("fixed z-[100] flex h-full flex-col transition-all duration-200", variant === "admin" && "sudo-variant")}
      >
        <div className="app-logo-container flex h-20 items-center">
          <UserMenu user={currentUser} />
        </div>
        <nav id="side-menu" className="flex min-h-0 flex-1 flex-col">
          <div className={cn("flex min-h-0 flex-1 flex-col overflow-y-auto", variant !== "admin" && "py-4")}>
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
            <div className="mt-3 border-t border-white/10 pt-3">
              <div
                title="You're using features that are still being built. Things may work differently for you than for your teammates."
                className="menu-item mx-3 flex h-8 items-center rounded-lg text-sm font-medium text-amber-300"
              >
                <span className="hero-wrench-screwdriver h-5 w-5" />
                <span className="menu-item-text truncate">Experimental</span>
              </div>
            </div>
          )}
          <div className="primary-light mt-3 border-t border-white/10 pt-5 text-center">
            {collapsed ? <OpenFnLogoCollapsed className="mx-auto h-6" /> : <OpenFnLogo className="mx-auto h-6" />}
            <code className="block py-1 text-[8px] opacity-50">{releaseLabel}</code>
          </div>
          <button
            type="button"
            onClick={onToggle}
            className="sidebar-toggle-btn mt-2 flex border-t border-white/10 py-1.5 pl-6 transition-colors hover:bg-white/5 focus:outline-none"
            title="Toggle sidebar"
            aria-label="Toggle sidebar"
          >
            <svg className="h-5 w-5 text-white/70" viewBox="0 0 18 18" fill="currentColor" aria-hidden="true">
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
          </button>
        </nav>
      </div>
    </>
  );
}
