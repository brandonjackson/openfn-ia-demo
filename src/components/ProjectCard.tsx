import { Link } from "react-router-dom";
import { Workflow, Users } from "lucide-react";
import type { ProjectSummary } from "../page-data";
import Card from "./Card";

const environmentDot: Record<string, string> = {
  production: "bg-green-500",
  staging: "bg-yellow-500",
};

interface Props {
  project: ProjectSummary;
}

/**
 * Clickable tile on the Projects list. Opening it drops you into the project.
 */
export default function ProjectCard({ project }: Props) {
  const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;

  return (
    <Link to={`/projects/${project.id}`} className="group block h-full">
      <Card className="h-full flex flex-col transition-all group-hover:border-blue-300 group-hover:shadow-sm">
        <h3
          className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 line-clamp-2 break-words"
          title={project.name}
        >
          {project.name}
        </h3>
        <p className="mt-1 text-xs text-gray-500 leading-relaxed line-clamp-2 min-h-[2.5rem]">
          {project.description || <span className="italic text-gray-400">No description</span>}
        </p>

        <div className="mt-4 flex items-center gap-4 text-xs text-gray-500">
          <span className="inline-flex items-center gap-1">
            <Workflow size={12} className="text-gray-400" />
            {plural(project.workflowCount, "workflow")}
          </span>
          <span className="inline-flex items-center gap-1">
            <Users size={12} className="text-gray-400" />
            {plural(project.memberCount, "member")}
          </span>
        </div>

        <div className="mt-auto pt-4">
          <div className="flex items-center gap-1.5 border-t border-gray-100 pt-3 text-xs text-gray-500">
            <span
              className={`h-1.5 w-1.5 flex-shrink-0 rounded-full ${environmentDot[project.environment] ?? "bg-gray-400"}`}
            />
            <span>{project.environment}</span>
            <span className="text-gray-300">·</span>
            <span>
              {project.serviceCount === 0
                ? "No services"
                : `${project.liveServiceCount}/${project.serviceCount} services live`}
            </span>
            <span className="ml-auto truncate text-gray-400">
              {project.lastActivity === "Never" ? "No activity yet" : project.lastActivity}
            </span>
          </div>
        </div>
      </Card>
    </Link>
  );
}
