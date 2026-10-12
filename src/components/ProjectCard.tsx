import { Link } from "react-router-dom";
import { ChevronRight, Folder, Workflow, Users } from "lucide-react";
import type { ProjectSummary } from "../page-data";

const environmentDot: Record<string, string> = {
  production: "bg-green-500",
  staging: "bg-yellow-500",
};

interface Props {
  project: ProjectSummary;
}

/**
 * Full-width row on the Projects list, laid out like the Systems and
 * Services lists. Opening it drops you into the project.
 */
export default function ProjectCard({ project }: Props) {
  const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;

  return (
    <Link
      to={`/projects/${project.id}`}
      className="group flex items-center gap-4 rounded-lg border border-gray-200 bg-white p-4 hover:border-blue-300 hover:shadow-sm transition-all"
    >
      <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-50">
        <Folder size={20} className="text-gray-400 group-hover:text-blue-500" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 min-w-0">
          <h3
            className="font-medium text-gray-900 group-hover:text-blue-600 text-sm truncate"
            title={project.name}
          >
            {project.name}
          </h3>
          <span className="inline-flex flex-shrink-0 items-center gap-1.5 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
            <span
              className={`h-1.5 w-1.5 rounded-full ${environmentDot[project.environment] ?? "bg-gray-400"}`}
            />
            {project.environment}
          </span>
        </div>
        <p className="mt-0.5 text-sm text-gray-500 truncate">
          {project.description || <span className="italic text-gray-400">No description</span>}
        </p>
        <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-400">
          <span className="inline-flex items-center gap-1">
            <Workflow size={11} />
            {plural(project.workflowCount, "workflow")}
          </span>
          <span className="inline-flex items-center gap-1">
            <Users size={11} />
            {plural(project.memberCount, "member")}
          </span>
          <span>
            {project.serviceCount === 0
              ? "No services"
              : `${project.liveServiceCount}/${project.serviceCount} services live`}
          </span>
          <span>
            {project.lastActivity === "Never" ? "No activity yet" : `Active ${project.lastActivity}`}
          </span>
        </div>
      </div>
      <ChevronRight size={16} className="text-gray-300 group-hover:text-blue-400 flex-shrink-0" />
    </Link>
  );
}
