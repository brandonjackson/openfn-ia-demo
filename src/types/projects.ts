/** Projects and their members (Lightning.Projects.Project, ProjectUser). Types only: no data, no behaviour. */

export type ProjectRole = "owner" | "admin" | "editor" | "viewer";

export type RetentionPolicy = "retain_all" | "retain_with_errors" | "erase_all";

export interface ProjectMember {
  userId: string;
  role: ProjectRole;
  failureAlert: boolean;
  digest: "never" | "daily" | "weekly" | "monthly";
}

export interface Project {
  id: string;
  name: string;
  description: string;
  /** Sandboxes point at their parent project. */
  parentId: string | null;
  /** Hex colour used for sandbox accents in the picker and banner. */
  color: string | null;
  concurrency: number | null;
  retentionPolicy: RetentionPolicy;
  historyRetentionPeriod: number | null;
  dataclipRetentionPeriod: number | null;
  requiresMfa: boolean;
  members: ProjectMember[];
  /** When the project was last touched (for the projects dashboard). */
  lastUpdatedAt: string;
  insertedAt: string;
}
