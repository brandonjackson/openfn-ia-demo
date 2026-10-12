import { Link, useLocation } from "react-router-dom";
import {
  ChevronLeft,
  LayoutDashboard,
  Globe,
  LibraryBig,
  BookOpen,
  Activity,
  ChartColumn,
  Clock,
  Folder,
  FolderKanban,
  Layers,
  ArrowLeftRight,
  FlaskConical,
  Archive,
  Settings,
  BookMarked,
  LifeBuoy,
} from "lucide-react";
import { mainNavGroups, mainNavTree, openfnDocsUrl, supportTree } from "../ia-tree";
import { projects, recentProjects } from "../mock-data/projects";
import type { Project } from "../mock-data/projects";
import { currentOrg, currentUser } from "../mock-data/user";
import SidebarLink from "./SidebarLink";
import SidebarSection from "./SidebarSection";
import AccountMenu from "./AccountMenu";
import type { LucideIcon } from "lucide-react";

const navIcons: Record<string, LucideIcon> = {
  overview: LayoutDashboard,
  handbook: BookOpen,
  "connected-systems": Globe,
  "service-catalog": LibraryBig,
  status: Activity,
  insights: ChartColumn,
  history: Clock,
  projects: FolderKanban,
};

/** Sections of the in-project nav, mirroring Lightning's project menu. */
const projectSections: { id: string; label: string; icon: LucideIcon }[] = [
  { id: "", label: "Overview", icon: LayoutDashboard },
  { id: "workflows", label: "Workflows", icon: Layers },
  { id: "channels", label: "Channels", icon: ArrowLeftRight },
  { id: "sandboxes", label: "Sandboxes", icon: FlaskConical },
  { id: "history", label: "History", icon: Archive },
  { id: "settings", label: "Settings", icon: Settings },
];

/** True when the URL is at `path` or anywhere beneath it. */
function isAt(pathname: string, path: string) {
  return pathname === path || pathname.startsWith(path + "/");
}

function ProjectNav({ project }: { project: Project }) {
  const location = useLocation();
  const base = "/projects/" + project.id;
  const sectionIds = projectSections.map((s) => s.id).filter(Boolean);
  // Anything under the project that isn't its own nav section (services,
  // components) is reached from the Overview, so Overview stays lit.
  const activeSection =
    sectionIds.find((id) => isAt(location.pathname, `${base}/${id}`)) ?? "";

  return (
    <>
      <div className="px-4 py-3 border-b border-gray-200">
        <Link
          to="/projects"
          className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-gray-900 transition-colors"
        >
          <ChevronLeft size={12} />
          All projects
        </Link>
      </div>
      <nav className="p-3 flex-1 overflow-y-auto space-y-0.5">
        {projectSections.map((section) => (
          <SidebarLink
            key={section.label}
            to={section.id ? `${base}/${section.id}` : base}
            icon={section.icon}
            label={section.label}
            active={activeSection === section.id}
          />
        ))}
      </nav>
    </>
  );
}

function OrgNav() {
  const { pathname } = useLocation();

  return (
    <nav className="p-3 flex-1 overflow-y-auto space-y-5">
      {mainNavGroups.map((group) => (
        <SidebarSection key={group.label ?? "top"} label={group.label}>
          {group.items.map((id) => {
            const node = mainNavTree.find((n) => n.id === id);
            if (!node) return null;
            return (
              <SidebarLink
                key={id}
                to={"/" + id}
                icon={navIcons[id] ?? LayoutDashboard}
                label={node.label}
                active={isAt(pathname, "/" + id) || (id === "overview" && pathname === "/")}
              />
            );
          })}
        </SidebarSection>
      ))}

      <SidebarSection label="Projects">
        {recentProjects.slice(0, 4).map((project) => (
          <SidebarLink
            key={project.id}
            to={"/projects/" + project.id}
            icon={Folder}
            label={project.name}
          />
        ))}
        <SidebarLink
          to="/projects"
          icon={FolderKanban}
          label="View all"
          active={pathname === "/projects"}
        />
      </SidebarSection>
    </nav>
  );
}

/** The project the current URL is inside, if any. */
function useCurrentProject(): Project | undefined {
  const location = useLocation();
  const match = location.pathname.match(/^\/projects\/([^/]+)/);
  return match ? projects.find((p) => p.id === match[1]) : undefined;
}

/**
 * App sidebar. At the org level it shows the grouped top-level IA
 * (Overview; Context; Monitoring; recent Projects). Once you open a project
 * it swaps to that project's own menu. The logo always returns to Overview,
 * Support stays pinned near the bottom, and the account menu sits below it.
 */
export default function Sidebar() {
  const project = useCurrentProject();
  const { pathname } = useLocation();
  const getHelp = supportTree.find((n) => n.id === "get-help")!;

  return (
    <aside className="w-72 border-r border-gray-200 bg-white flex-shrink-0 flex flex-col h-full">
      {/* Logo: always a clear way back to the root. */}
      <div className="px-4 py-4">
        <Link to="/" className="flex items-center gap-2" title="Back to Overview">
          <div className="w-7 h-7 bg-indigo-600 rounded-md flex items-center justify-center">
            <span className="text-white text-xs font-bold">{currentOrg.initials}</span>
          </div>
          <span className="text-lg font-semibold text-gray-900">{currentOrg.name}</span>
        </Link>
      </div>

      {project ? <ProjectNav project={project} /> : <OrgNav />}

      <div className="p-3 space-y-3">
        <SidebarSection label="Support">
          <SidebarLink href={openfnDocsUrl} icon={BookMarked} label="OpenFn Docs" />
          <SidebarLink
            to={"/" + getHelp.id}
            icon={LifeBuoy}
            label={getHelp.label}
            active={isAt(pathname, "/" + getHelp.id)}
          />
        </SidebarSection>
        <div className="border-t border-gray-200 pt-3">
          <AccountMenu user={currentUser} org={currentOrg} />
        </div>
      </div>
    </aside>
  );
}
