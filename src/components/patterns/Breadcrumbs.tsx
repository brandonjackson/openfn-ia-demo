import Link from "../primitives/Link";
import { ChevronRight, Home } from "lucide-react";
import ProjectContextBar from "./ProjectContextBar";
import { useShell } from "./shell-context";

interface Crumb {
  label: string;
  path: string;
}

/**
 * Page breadcrumbs. Inside a project the Home and Projects crumbs give way to
 * the {@link ProjectContextBar}'s project and sandbox pickers.
 */
export default function Breadcrumbs({
  ancestors,
  current,
}: {
  ancestors: Crumb[];
  current: string;
}) {
  const { currentPath: pathname, project, recentProjects, sandbox, onSelectSandbox, onNavigate } = useShell();

  if (project) {
    const base = `/projects/${project.id}`;
    return (
      <ProjectContextBar
        project={project}
        recentProjects={recentProjects}
        sandbox={sandbox}
        onSelectSandbox={onSelectSandbox}
        currentPath={pathname}
        onNavigate={onNavigate}
        // The workflow editor sits outside the project's URLs but belongs to it.
        trail={ancestors.filter((a) => a.path.startsWith(base + "/") || a.path.startsWith("/workflow-editor/"))}
        current={pathname === base ? undefined : current}
      />
    );
  }

  return (
    <nav className="flex items-center gap-1.5 text-sm text-gray-500">
      <Link to="/" className="hover:text-gray-900 flex items-center gap-1">
        <Home size={14} />
      </Link>
      {ancestors.map((a) => (
        <span key={a.path} className="flex items-center gap-1.5">
          <ChevronRight size={14} className="text-gray-300" />
          <Link to={a.path} className="hover:text-gray-900">
            {a.label}
          </Link>
        </span>
      ))}
      <span className="flex items-center gap-1.5">
        <ChevronRight size={14} className="text-gray-300" />
        <span className="text-gray-900 font-medium">{current}</span>
      </span>
    </nav>
  );
}
