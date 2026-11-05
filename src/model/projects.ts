import type { ProjectComponentType, ProjectServiceItem, ProjectSummary } from "./page-data";

export type ProjectService = ProjectServiceItem;

export interface ProjectComponent {
  id: string;
  name: string;
  description: string;
  type: ProjectComponentType;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  /** Environment shown on the project card (e.g. "production"). */
  environment: string;
  /** Human-readable time since the project last ran or changed. */
  lastActivity: string;
  memberCount: number;
  /** Sandboxes (branches) of this project. The first is always "main". */
  sandboxes: string[];
  services: ProjectService[];
  components: ProjectComponent[];
}

/** Card-sized summary of a project, used by the Projects list. */
export function summarizeProject(project: Project): ProjectSummary {
  return {
    id: project.id,
    name: project.name,
    description: project.description,
    environment: project.environment,
    lastActivity: project.lastActivity,
    memberCount: project.memberCount,
    workflowCount: project.components.filter((c) => c.type === "Workflow").length,
    serviceCount: project.services.length,
    liveServiceCount: project.services.filter((s) => s.status === "Live").length,
  };
}
