/** The audit trail (api/audit-events.md): who changed what, and when. */

/** The kinds of record the audit trail follows. */
export type AuditItemType = "workflow" | "credential" | "project" | "user" | "collection" | "channel" | "oauth_client";

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
  /** Matches the actor or the item's name or id. */
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
  /** Every event name in the trail, for the event filter. */
  eventNames: string[];
}
