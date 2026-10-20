import { Folder, Workflow, Users } from "lucide-react";
import type { ProjectSummary } from "../page-data";
import ListRow from "./ListRow";

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
    <ListRow
      to={`/projects/${project.id}`}
      icon={Folder}
      title={project.name}
      badges={
        <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
          <span
            className={`h-1.5 w-1.5 rounded-full ${environmentDot[project.environment] ?? "bg-gray-400"}`}
          />
          {project.environment}
        </span>
      }
      description={
        project.description || <span className="italic text-gray-400">No description</span>
      }
      meta={
        <>
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
        </>
      }
    />
  );
}
