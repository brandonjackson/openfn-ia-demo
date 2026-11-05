import Link from "../primitives/Link";
import {
  ChevronLeft,
  LayoutDashboard,
  Globe,
  LibraryBig,
  BookOpen,
  Activity,
  ChartColumn,
  Lightbulb,
  Folder,
  FolderKanban,
  Workflow,
  Boxes,
  Sparkles,
  Rocket,
  FlaskConical,
  Settings,
  BookMarked,
  LifeBuoy,
  X,
  ArrowLeftRight,
} from "lucide-react";
import { mainNavTree, openfnDocsUrl, supportTree, visibleNavGroups } from "../../model/ia-tree";
import type { FlagId } from "../../model/feature-flags";
import type { Project } from "../../model/projects";
import { useDismiss } from "../primitives/use-popover";
import IconButton from "../primitives/IconButton";
import InstanceLogo from "./InstanceLogo";
import NavItem from "../primitives/NavItem";
import SidebarSection from "../patterns/SidebarSection";
import AccountMenu from "./AccountMenu";
import { useShell } from "./shell-context";
import type { LucideIcon } from "lucide-react";

const navIcons: Record<string, LucideIcon> = {
  overview: LayoutDashboard,
  handbook: BookOpen,
  "connected-systems": Globe,
  "service-catalog": LibraryBig,
  status: Activity,
  insights: Lightbulb,
  history: ChartColumn,
  projects: FolderKanban,
};

interface ProjectSection {
  id: string;
  label: string;
  icon: LucideIcon;
  /** The feature flag the section belongs to; off, it's left out. */
  flag?: FlagId;
  /** What it's called when a flag is off, for a section that narrows rather than goes. */
  whenOff?: { flag: FlagId; label: string; icon: LucideIcon };
}

/**
 * The in-project nav, grouped like the instance-level sidebar: Overview on its
 * own, then Build (making things) and Maintain (keeping them running).
 */
const projectNavGroups: { label?: string; sections: ProjectSection[] }[] = [
  { sections: [{ id: "", label: "Overview", icon: LayoutDashboard }] },
  {
    label: "Build",
    sections: [
      { id: "create", label: "Create", icon: Sparkles, flag: "aiBuild" },
      { id: "workflows", label: "Workflows", icon: Workflow },
      {
        id: "components",
        label: "Components",
        icon: Boxes,
        whenOff: { flag: "components", label: "Channels", icon: ArrowLeftRight },
      },
      { id: "sandboxes", label: "Sandboxes", icon: FlaskConical },
    ],
  },
  {
    label: "Maintain",
    sections: [
      { id: "history", label: "History", icon: ChartColumn },
      { id: "insights", label: "Insights", icon: Lightbulb },
      { id: "deployments", label: "Deployments", icon: Rocket, flag: "deployments" },
      { id: "settings", label: "Settings", icon: Settings },
    ],
  },
];

/** True when the URL is at `path` or anywhere beneath it. */
function isAt(pathname: string, path: string) {
  return pathname === path || pathname.startsWith(path + "/");
}

function ProjectNav({ project }: { project: Project }) {
  const { currentPath, flags } = useShell();
  const base = "/projects/" + project.id;
  const groups = projectNavGroups.map((g) => ({
    ...g,
    sections: g.sections
      .filter((s) => !s.flag || flags[s.flag])
      .map((s) => (s.whenOff && !flags[s.whenOff.flag] ? { ...s, ...s.whenOff } : s)),
  }));
  const sectionIds = groups
    .flatMap((g) => g.sections.map((s) => s.id))
    .filter(Boolean);
  // Anything under the project that isn't its own nav section (services)
  // is reached from the Overview, so Overview stays lit.
  const activeSection =
    sectionIds.find((id) => isAt(currentPath, `${base}/${id}`)) ?? "";

  return (
    <>
      <div className="px-4 py-3 border-b border-gray-200">
        <Link
          to="/projects"
          data-ui="sidebar-back"
          className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-gray-900 transition-colors"
        >
          <ChevronLeft size={12} />
          All projects
        </Link>
      </div>
      <nav className="p-3 flex-1 overflow-y-auto space-y-5">
        {groups.map((group) => (
          <SidebarSection key={group.label ?? "top"} label={group.label}>
            {group.sections.map((section) => (
              <NavItem
                key={section.label}
                to={section.id ? `${base}/${section.id}` : base}
                icon={section.icon}
                label={section.label}
                active={activeSection === section.id}
              />
            ))}
          </SidebarSection>
        ))}
      </nav>
    </>
  );
}

function OrgNav() {
  const { currentPath: pathname, recentProjects, flags } = useShell();

  return (
    <nav className="p-3 flex-1 overflow-y-auto space-y-5">
      {visibleNavGroups(flags).map((group) => (
        <SidebarSection key={group.label ?? "top"} label={group.label}>
          {group.items.map((id) => {
            const node = mainNavTree.find((n) => n.id === id);
            if (!node) return null;
            return (
              <NavItem
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
          <NavItem
            key={project.id}
            to={"/projects/" + project.id}
            icon={Folder}
            label={project.name}
          />
        ))}
        <NavItem
          to="/projects"
          icon={FolderKanban}
          label="View all"
          active={pathname === "/projects"}
        />
      </SidebarSection>
    </nav>
  );
}

/**
 * App sidebar. At the instance level it shows the grouped top-level IA
 * (Overview; Organization; Monitoring; recent Projects), leaving out what the
 * feature flags turn off. Once you open a project
 * it swaps to that project's own menu (Overview; Build; Maintain). The logo always returns to Overview,
 * Support stays pinned near the bottom, and the account menu sits below it.
 *
 * From the `md` breakpoint up it sits in the page's flow. Below it, it's a
 * drawer: off-screen until `open`, then it slides in over a dimmed page and
 * slides back out on its close button, a tap outside or Escape.
 */
export default function Sidebar({ open = false, onClose }: { open?: boolean; onClose?: () => void }) {
  const { project, currentPath: pathname, user, instance, flags } = useShell();
  const getHelp = supportTree.find((n) => n.id === "get-help")!;
  const ref = useDismiss<HTMLElement>(open, () => onClose?.());

  return (
    <>
      {/* Dims the page behind the drawer on small screens. */}
      <div
        aria-hidden
        className={`md:hidden fixed inset-0 z-30 bg-black/40 transition-opacity duration-200 ${
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      />
      <aside
        ref={ref}
        data-ui="sidebar"
        className={`w-72 max-w-[85vw] border-r border-gray-200 bg-white flex-shrink-0 flex flex-col h-full fixed inset-y-0 left-0 z-40 transition-transform duration-200 ease-out md:static md:z-auto md:translate-x-0 md:transition-none ${
          open ? "translate-x-0 shadow-xl md:shadow-none" : "-translate-x-full"
        }`}
      >
        {/* Logo: always a clear way back to the root. */}
        <div data-ui="sidebar-logo" className="px-4 py-4 flex items-center justify-between gap-2">
          <InstanceLogo
            instance={instance}
            title={flags.organizations ? "Back to Overview" : "Back to projects"}
          />
          <div className="md:hidden">
            <IconButton icon={X} label="Close menu" size="md" onClick={onClose} />
          </div>
        </div>

        {project ? <ProjectNav project={project} /> : <OrgNav />}

        <div className="p-3 space-y-3">
          <SidebarSection label="Support">
            <NavItem href={openfnDocsUrl} icon={BookMarked} label="OpenFn docs" />
            <NavItem
              to={"/" + getHelp.id}
              icon={LifeBuoy}
              label={getHelp.label}
              active={isAt(pathname, "/" + getHelp.id)}
            />
          </SidebarSection>
          <div className="border-t border-gray-200 pt-3">
            <AccountMenu user={user} instance={instance} showOrganizationSettings={flags.organizations} />
          </div>
        </div>
      </aside>
    </>
  );
}
