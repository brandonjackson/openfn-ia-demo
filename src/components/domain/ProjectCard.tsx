import { Copy, Folder, Settings, Workflow, Users } from "lucide-react";
import type { ProjectSummary } from "../../model/projects";
import { timeAgo } from "../../model/time";
import ListRow from "../primitives/ListRow";
import type { ListRowMenu } from "../primitives/ListRow";

interface Props {
  project: ProjectSummary;
  /** Makes a copy of it. Left out, its ⋮ menu has no Make a copy. */
  onCopy?: () => void;
  /** Links to its settings from its ⋮ menu. */
  showSettings?: boolean;
  /** More actions for its ⋮ menu, after Make a copy and Settings. */
  menu?: ListRowMenu;
}

/**
 * Full-width row on the Projects list, laid out like the Systems and
 * Services lists. Opening it drops you into the project; its ⋮ menu can also
 * make a copy of it and open its settings.
 */
export default function ProjectCard({ project, onCopy, showSettings = false, menu }: Props) {
  const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;

  return (
    <ListRow
      to={`/projects/${project.id}`}
      icon={Folder}
      menu={{
        items: [
          ...(onCopy ? [{ id: "copy", label: "Make a copy", icon: Copy }] : []),
          ...(showSettings ? [{ id: "settings", label: "Settings", icon: Settings, to: `/projects/${project.id}/settings` }] : []),
          ...(menu?.items ?? []),
        ],
        onSelect: (id) => (id === "copy" ? onCopy?.() : id === "settings" ? undefined : menu?.onSelect?.(id)),
      }}
      title={project.name}
      description={
        project.description || <span className="italic text-gray-500">No description</span>
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
              {project.serviceCount === 0 ? "No services" : plural(project.serviceCount, "service")}
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
