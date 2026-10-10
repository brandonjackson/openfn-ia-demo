import { Link, useLocation } from "react-router-dom";
import {
  ChevronLeft,
  User,
  Building2,
  GitCompare,
  LayoutDashboard,
  Globe,
  BookOpen,
  Clock,
  FolderKanban,
  Layers,
  ArrowLeftRight,
  FlaskConical,
  Archive,
  Settings,
} from "lucide-react";
import { mainNavTree } from "../ia-tree";
import { projects } from "../mock-data/projects";
import type { Project } from "../mock-data/projects";
import { currentUser } from "../mock-data/user";
import type { LucideIcon } from "lucide-react";

const navIcons: Record<string, LucideIcon> = {
  overview: LayoutDashboard,
  projects: FolderKanban,
  "connected-systems": Globe,
  "service-catalog": BookOpen,
  history: Clock,
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

function SidebarLink({
  to,
  icon: Icon,
  label,
  active,
}: {
  to: string;
  icon: LucideIcon;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      to={to}
      className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors ${
        active
          ? "bg-blue-50 text-blue-700 font-medium"
          : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
      }`}
    >
      <Icon size={14} className="flex-shrink-0" />
      <span className="truncate">{label}</span>
    </Link>
  );
}

function ProjectNav({ project }: { project: Project }) {
  const location = useLocation();
  const base = "/projects/" + project.id;
  const sectionIds = projectSections.map((s) => s.id).filter(Boolean);
  // Anything under the project that isn't its own nav section (services,
  // components) is reached from the Overview, so Overview stays lit.
  const activeSection =
    sectionIds.find(
      (id) => location.pathname === `${base}/${id}` || location.pathname.startsWith(`${base}/${id}/`)
    ) ?? "";

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
        <p className="mt-1 text-sm font-semibold text-gray-900 line-clamp-2" title={project.name}>
          {project.name}
        </p>
        <p className="mt-0.5 text-xs text-gray-400">{project.environment}</p>
      </div>
      <nav className="p-2 flex-1 overflow-y-auto space-y-0.5">
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
  const location = useLocation();
  return (
    <nav className="p-2 flex-1 overflow-y-auto space-y-0.5">
      {mainNavTree.map((node) => {
        const path = "/" + node.id;
        const active =
          location.pathname === path ||
          location.pathname.startsWith(path + "/") ||
          (node.id === "overview" && location.pathname === "/");
        return (
          <SidebarLink
            key={node.id}
            to={path}
            icon={navIcons[node.id] ?? LayoutDashboard}
            label={node.label}
            active={active}
          />
        );
      })}
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
 * App sidebar. At the org level it shows the top-level IA (Overview,
 * Projects, Systems, ...). Once you open a project it swaps to that project's
 * own menu, with the top-left corner taking you back to all projects.
 */
export default function Sidebar() {
  const project = useCurrentProject();

  return (
    <aside className="w-72 border-r border-gray-200 bg-gray-50 flex-shrink-0 flex flex-col h-full">
      {/* Logo: inside a project it doubles as the way back out. */}
      <div className="p-4 border-b border-gray-200">
        <Link
          to={project ? "/projects" : "/"}
          className="flex items-center gap-2"
          title={project ? "Back to all projects" : undefined}
        >
          <div className="w-7 h-7 bg-indigo-600 rounded-md flex items-center justify-center">
            <span className="text-white text-xs font-bold">SD</span>
          </div>
          <span className="text-lg font-semibold text-gray-900">Sim DTU</span>
        </Link>
      </div>

      {project ? (
        <ProjectNav project={project} />
      ) : (
        <OrgNav />
      )}

      {/* Footer */}
      <div className="border-t border-gray-200 p-2">
        <Link
          to="/ia-comparison"
          className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
        >
          <GitCompare size={14} />
          <span>IA Comparison</span>
        </Link>
        <Link
          to="/user-settings"
          className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
        >
          <User size={14} />
          <span>
            {currentUser.firstName} {currentUser.lastName}
          </span>
        </Link>
        <Link
          to="/org-settings"
          className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
        >
          <Building2 size={14} />
          <span>Org Settings</span>
        </Link>
      </div>
    </aside>
  );
}
