/** The audit trail (api/audit-events.md): who changed what, and when. */

/** The kinds of record the audit trail follows. */
export type AuditItemType = "workflow" | "credential" | "project" | "user" | "collection" | "channel" | "oauth_client";

/**
 * The events Lightning records, for the trail's event filter. The API lists
 * events but not which names exist, so the names are fixed here.
 */
export const auditEventNames = [
  "access_revoked",
  "added_to_project",
  "allow_support_access_updated",
  "collaborator_added",
  "collaborator_removed",
  "collaborator_role_changed",
  "created",
  "dataclip_retention_period_updated",
  "deleted",
  "disabled",
  "enabled",
  "file_added",
  "file_removed",
  "history_retention_period_updated",
  "logo_removed",
  "logo_updated",
  "marked_for_deletion",
  "member_added",
  "member_invited",
  "member_removed",
  "removed_from_project",
  "removed_from_trigger",
  "repo_connection_created",
  "repo_connection_removed",
  "requested",
  "requires_mfa_updated",
  "role_changed",
  "snapshot_created",
  "token_issued",
  "token_refreshed",
  "token_revoked",
  "updated",
  "updated_by_provisioner",
] as const;

/** One field an audited change touched. */
export interface AuditChange {
  field: string;
  /** The value before, absent when the field was new. */
  before?: string;
  /** The value after, absent when the field was removed. */
  after?: string;
}

/** One entry in the audit trail. */
export interface AuditEvent {
  id: string;
  /** When it happened, e.g. "5 Nov 2026, 09:14". */
  occurredAt: string;
  /** What happened, in Lightning's own words, e.g. "created", "snapshot_created", "collaborator_added". */
  event: string;
  itemType: AuditItemType;
  /** The record it happened to: its name, where it has one, and its short id. */
  item: { name?: string; id: string };
  /** Who did it: a person's name, or a system actor such as "GitHub sync". */
  actor: { label: string; identifier?: string };
  /** The fields that changed, before and after. Empty when the event carries no diff. */
  changes: AuditChange[];
}

/** Which audit events to show: the filters and the page. */
export interface AuditQuery {
  /** Matches the actor or the item's name or short id. */
  search: string;
  /** One event name, or "" for every event. */
  event: string;
  /** One item type, or "" for every type. */
  itemType: AuditItemType | "";
  /** 1-based. */
  page: number;
}

/** One page of the audit trail. */
export interface AuditPage {
  /** The events on this page, newest first. */
  entries: AuditEvent[];
  /** How many events match the filters, across all pages. */
  total: number;
  pageSize: number;
  /** The event names the event filter offers. */
  eventNames: string[];
}

/** How many audit events show on one page. */
export const AUDIT_PAGE_SIZE = 10;
