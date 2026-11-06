import type { ProjectComponentType } from "./page-data";
import type { ProjectServiceItem } from "./services";

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
  /** How long ago it last ran or changed, in the fixtures' words ("3 days ago"). Never shown as is: cards get a time. */
  lastActivity: string;
  memberCount: number;
  /** Sandboxes (branches) of this project. The first is always "main". */
  sandboxes: string[];
  services: ProjectService[];
  components: ProjectComponent[];
}

/** A project's card on the Projects list and Overview. */
export interface ProjectSummary {
  id: string;
  name: string;
  description: string;
  environment: string;
  /** When a workflow in it last changed, as the API sends it; null when nothing has. The card words it. */
  lastActivity: string | null;
  memberCount: number;
  workflowCount: number;
  /** Its published services, and how many are live. Absent without the service catalog. */
  serviceCount?: number;
  liveServiceCount?: number;
}

/**
 * A project's card from the API: its counts from `include=stats`, and its
 * services' counts when it's given them (leave `services` out without the
 * service catalog, and the card shows none).
 */
export function toProjectSummary(details: ProjectDetails, services?: Pick<ProjectService, "status">[]): ProjectSummary {
  return {
    id: details.id,
    name: details.name,
    description: details.description,
    environment: details.env,
    lastActivity: details.lastActivity ?? null,
    memberCount: details.collaboratorsCount ?? 0,
    workflowCount: details.workflowsCount ?? 0,
    ...(services && { serviceCount: services.length, liveServiceCount: services.filter((s) => s.status === "Live").length }),
  };
}

/**
 * The cards for the projects you can open, each with its own services'
 * counts. Leave `services` out without the service catalog, or while they
 * can't be loaded, and the cards show no counts rather than wrong ones.
 */
export function projectSummaries(projects: ProjectDetails[], services?: (Pick<ProjectService, "status"> & { projectId: string })[]): ProjectSummary[] {
  return projects.filter(isOpenable).map((p) => toProjectSummary(p, services?.filter((s) => s.projectId === p.id)));
}

/** The projects you're a member of that aren't being deleted: what the projects list, Overview and the sidebar show. */
export const isOpenable = (p: ProjectDetails) => !!p.role && !p.scheduledDeletion;

/** How long a project keeps its history and its runs' data (Lightning's data retention). */
export type RetentionPolicy = "retain_all" | "retain_with_errors" | "erase_all";

/**
 * A project as the API holds it: the facts any server would send, read by the
 * wrappers and mapped onto each page's data.
 */
export interface ProjectDetails {
  id: string;
  /** URL-safe: lowercase letters, digits and hyphens. */
  name: string;
  description: string;
  /** The environment credentials load their values from. */
  env: string;
  /** For a sandbox, the project it was made from. */
  parentId: string | null;
  /** For a sandbox, the project at the top of its tree; for a project, itself. */
  rootId: string;
  /** A sandbox's colour, as a hex string. */
  color: string | null;
  /** How many runs at once; null for no limit, 1 for one at a time. */
  concurrency: number | null;
  retentionPolicy: RetentionPolicy;
  /** Days to keep history; null keeps everything. */
  historyRetentionDays: number | null;
  /** Days to keep runs' input and output data; null keeps it as long as the history. */
  dataclipRetentionDays: number | null;
  /** The retention periods the plan allows, in days. */
  allowedRetentionDays: number[];
  requiresMfa: boolean;
  allowSupportAccess: boolean;
  /** When the project will be removed, once its deletion is scheduled. */
  scheduledDeletion: string | null;
  createdAt: string;
  /** Your role in it; absent when you're not a member (a superuser listing every project). */
  role?: import("./project-settings").ProjectRole;
  workflowsCount?: number;
  collaboratorsCount?: number;
  /** When a workflow in it last changed, or null. */
  lastActivity?: string | null;
  /** Who owns it, when listed. */
  owner?: { id: string; email: string; firstName: string; lastName: string } | null;
  /** What you may do in it, by the API's action names. */
  permissions?: Partial<Record<ProjectAction, boolean>>;
}

/** The actions the API answers `permissions` for, by its names. */
export type ProjectAction =
  | "access_project"
  | "delete_project"
  | "edit_project"
  | "edit_data_retention"
  | "edit_run_settings"
  | "add_project_user"
  | "remove_project_user"
  | "write_webhook_auth_method"
  | "write_github_connection"
  | "create_workflow"
  | "edit_workflow"
  | "delete_workflow"
  | "run_workflow"
  | "create_project_credential"
  | "initiate_github_sync"
  | "create_channel"
  | "update_channel"
  | "delete_channel"
  | "edit_failure_alerts"
  | "edit_digest_alerts"
  | "create_keychain_credential"
  | "manage_collection"
  | "provision_sandbox";

/** One member of a project, as the API lists them. */
export interface ProjectMember {
  /** The user's id. */
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  role: import("./project-settings").ProjectRole;
  failureAlert: boolean;
  digest: import("./project-settings").DigestFrequency;
}

/** Someone with an account on the instance. */
export interface InstanceUserSummary {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}
