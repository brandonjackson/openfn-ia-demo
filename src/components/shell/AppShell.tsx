import { useCallback, useState } from "react";
import { Outlet, useLocation, useParams } from "react-router-dom";
import { findProject } from "../../mock-data/projects";
import Sidebar, { type SidebarVariant } from "./Sidebar";
import Picker from "./Picker";
import { buildProjectPickerItems } from "./projectPickerItems";

/**
 * Lightning's logged-in layout (layouts/live.html.heex, settings.html.heex):
 * the side menu, the page, and the global project picker. Admin routes
 * (/settings/*) get the slate admin menu; project routes the project menu.
 */
export default function AppShell() {
  const { pathname } = useLocation();
  const { projectId } = useParams();
  const project = findProject(projectId);
  const [collapsed, setCollapsed] = useState(false);
  const toggle = useCallback(() => setCollapsed((c) => !c), []);

  const variant: SidebarVariant = pathname.startsWith("/settings")
    ? "admin"
    : project
      ? "project"
      : "profile";

  return (
    <main className="flex h-screen">
      <Sidebar variant={variant} project={project} collapsed={collapsed} onToggle={toggle} />
      <div className="min-w-0 flex-auto">
        <Outlet />
      </div>
      <Picker
        items={buildProjectPickerItems(pathname)}
        currentId={project?.id}
        placeholder="Search projects..."
        emptyMessage="No projects found"
        viewAllLabel="View all projects"
        viewAllHref="/projects"
        openEvent="open-project-picker"
        theme={variant === "admin" ? "sudo-variant" : "primary-theme"}
      />
    </main>
  );
}
