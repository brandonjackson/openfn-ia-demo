import { Folder, Workflow, Users } from "lucide-react";
import type { ProjectSummary } from "../../model/projects";
import { timeAgo } from "../../model/time";
import ListRow from "../primitives/ListRow";

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
          {project.serviceCount !== undefined && (
            <span>
              {project.serviceCount === 0
                ? "No services"
                : `${project.liveServiceCount ?? 0}/${project.serviceCount} services live`}
            </span>
          )}
          <span>
            {project.lastActivity ? `Active ${timeAgo(project.lastActivity)}` : "No activity yet"}
          </span>
        </>
      }
    />
  );
}
