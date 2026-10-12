import { Link, useLocation, useNavigate } from "react-router-dom";
import { ChevronRight, FlaskConical, Folder, FolderKanban } from "lucide-react";
import { recentProjects } from "../mock-data/projects";
import type { Project } from "../mock-data/projects";
import { useSandbox } from "../sandbox-state";
import Picker from "./Picker";

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
}

/** Project sections that exist in every project, so a switch can keep them. */
const sharedSections = ["workflows", "channels", "sandboxes", "history", "settings"];

/**
 * Top bar shown on every page inside a project, in place of breadcrumbs. A
 * project picker and a sandbox picker make it clear you're inside a project
 * and let you switch either one; any deeper pages follow as crumbs.
 */
export default function ProjectContextBar({ project, trail = [], current }: Props) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [sandbox, setSandbox] = useSandbox(project.id);

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
    navigate(
      sharedSections.includes(section) ? `/projects/${id}/${section}` : `/projects/${id}`
    );
  };

  return (
    <nav aria-label="Project" className="flex flex-wrap items-center gap-1.5 text-sm text-gray-500">
      <Picker
        icon={Folder}
        ariaLabel="Switch project"
        options={projectOptions}
        value={project.id}
        onChange={switchProject}
        footerAction={{ label: "View all", icon: FolderKanban, onClick: () => navigate("/projects") }}
      />
      <Picker
        icon={FlaskConical}
        ariaLabel="Switch sandbox"
        options={project.sandboxes.map((s) => ({ id: s, label: s }))}
        value={sandbox}
        onChange={setSandbox}
        maxWidthClass="max-w-[14rem]"
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
