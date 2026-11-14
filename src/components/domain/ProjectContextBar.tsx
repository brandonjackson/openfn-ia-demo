import Link from "../primitives/Link";
import { ChevronRight, Folder, FolderKanban } from "lucide-react";
import type { Project } from "../../model/projects";
import type { WorkflowChange } from "../../model/workflow-changes";
import Picker from "../primitives/Picker";
import SandboxChip from "./SandboxChip";

interface Crumb {
  label: string;
  path: string;
}

interface Props {
  project: Project;
  /** Pages between the project and the current page, e.g. Services. */
  trail?: Crumb[];
  /** The current page, when it isn't the project Overview. */
  current?: string;
  /** Projects opened lately, most recent first; the first four make the switcher's shortlist. */
  recentProjects: Project[];
  /** The sandbox selected in this project. */
  sandbox: string;
  /** Selects a sandbox in this project. */
  onSelectSandbox: (sandbox: string) => void;
  /** What the selected sandbox changes against its parent: the chip counts them and lists them. */
  sandboxChanges?: WorkflowChange[];
  /** Where the selected sandbox's changes would merge: "main" or its parent sandbox. */
  sandboxTarget?: string;
  /** Opens another project at a path, on its main. Left out, the switch goes through `onNavigate`. */
  onSwitchProject?: (projectId: string, path: string) => void;
  /** The URL being shown, so a project switch can stay on the same section. */
  currentPath: string;
  /** Goes to a page in the app. */
  onNavigate: (path: string) => void;
}

/** Project sections that exist in every project, so a switch can keep them. */
const sharedSections = ["workflows", "channels", "sandboxes", "history", "settings"];

/**
 * Top bar shown on every page inside a project, in place of breadcrumbs. A
 * project picker and the sandbox chip (the same one as the workflow editor's,
 * with its count of changes) make it clear you're inside a project and let
 * you switch either one; any deeper pages follow as crumbs. Switching project
 * opens the other one on main.
 */
export default function ProjectContextBar({
  project,
  trail = [],
  current,
  recentProjects,
  sandbox,
  onSelectSandbox,
  sandboxChanges,
  sandboxTarget,
  onSwitchProject,
  currentPath: pathname,
  onNavigate: navigate,
}: Props) {

  // Same shortlist as the sidebar's Projects section, plus the open project
  // if it isn't one of the recent ones.
  const shortlist = recentProjects.slice(0, 4);
  const projectOptions = (
    shortlist.some((p) => p.id === project.id) ? shortlist : [project, ...shortlist]
  ).map((p) => ({ id: p.id, label: p.name }));

  const switchProject = (id: string) => {
    if (id === project.id) return;
    // Stay on the same section (e.g. History) when the other project has it.
    const section = pathname.split("/")[3];
    const path = sharedSections.includes(section) ? `/projects/${id}/${section}` : `/projects/${id}`;
    // Another project always opens on main.
    if (onSwitchProject) onSwitchProject(id, path);
    else navigate(path);
  };

  return (
    <nav aria-label="Project" className="flex flex-wrap items-center gap-1.5 text-sm text-gray-500">
      <Picker
        icon={Folder}
        ariaLabel="Switch project"
        options={projectOptions}
        value={project.id}
        onChange={switchProject}
        size="sm"
        footerAction={{ label: "View all", icon: FolderKanban, onClick: () => navigate("/projects") }}
      />
      <SandboxChip
        sandboxes={project.sandboxes}
        value={sandbox}
        onChange={onSelectSandbox}
        changes={sandboxChanges}
        target={sandboxTarget}
        onViewAll={() => navigate(`/projects/${project.id}/sandboxes`)}
      />
      {trail.map((crumb) => (
        <span key={crumb.path} className="flex items-center gap-1.5">
          <ChevronRight size={14} className="text-gray-300" />
          <Link to={crumb.path} className="hover:text-gray-900">
            {crumb.label}
          </Link>
        </span>
      ))}
      {current && (
        <span className="flex items-center gap-1.5">
          <ChevronRight size={14} className="text-gray-300" />
          <span className="font-medium text-gray-900">{current}</span>
        </span>
      )}
    </nav>
  );
}
