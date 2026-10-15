/** Superuser admin views: audit trail and auth provider. Types only: no data, no behaviour. */
import type { Collection } from "./project-settings";
import type { Project } from "./projects";

export interface AuditEvent {
  id: string;
  /** ISO timestamp. */
  insertedAt: string;
  event: string;
  /** Item type as stored, e.g. "workflow"; the table shows the last dotted segment. */
  itemType: string;
  itemId: string;
  actorId: string;
  actorLabel: string;
  /** Email for users; null shows the actor's short id instead. */
  actorIdentifier: string | null;
  changes: { before: Record<string, string> | null; after: Record<string, string> | null };
  /** Encrypted credential bodies per environment, shown under the changes. */
  credentialBodies?: Record<string, string>;
}

export interface AuthProvider {
  id: string | null;
  name: string;
  discoveryUrl: string;
  clientId: string;
  clientSecret: string;
  redirectHost: string;
  allowUnverifiedEmail: boolean;
}

/** A row of /settings/projects: the project with its owner and deletion date joined in. */
export interface AdminProjectRow extends Project {
  /** The owner's full name; "" when the project has no owner. */
  ownerName: string;
  scheduledDeletion: string | null;
}

/** A row of /settings/collections: the collection with its project's name. */
export interface AdminCollectionRow extends Collection {
  projectName: string;
}

/** What Phoenix LiveDashboard's home page shows (a static approximation). */
export interface LiveDashboardData {
  systemInfo: string;
  versions: { elixir: string; phoenix: string; dashboard: string };
  uptime: string;
  totalInput: string;
  totalOutput: string;
  runQueues: { total: number; cpu: number; io: number };
  limits: { label: string; used: number; limit: number }[];
  memory: { label: string; value: number; color: string }[];
  tabs: string[];
}
