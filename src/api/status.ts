import { isApiError } from "./client";

/**
 * Where loading a page's data stands, for its wrapper: still loading, ready,
 * a record that isn't there (or that you can't see: the API answers both
 * 403 and 404 for that), or another failure with the server's message.
 */
export type LoadStatus =
  | { state: "loading" }
  | { state: "ready" }
  | { state: "notFound" }
  | { state: "forbidden" }
  | { state: "error"; message: string };

/**
 * A query's status. A reload that couldn't reach the server keeps what's
 * already on screen; one the server refused (the record is gone, being
 * deleted, or no longer yours to see) shows the refusal, not the old data.
 */
export function statusOf(query: { data: unknown; error: Error | null }): LoadStatus {
  const { error } = query;
  if (isApiError(error, "not_found") || isApiError(error, "invalid_parameter")) return { state: "notFound" };
  if (isApiError(error, "forbidden")) return { state: "forbidden" };
  if (isApiError(error, "scheduled_for_deletion")) return { state: "error", message: "This is scheduled for deletion." };
  if (query.data !== undefined) return { state: "ready" };
  if (!error) return { state: "loading" };
  return { state: "error", message: error.message };
}

/** Several queries' status together: the first failure, else loading until every one is ready. */
export function combine(...statuses: LoadStatus[]): LoadStatus {
  return (
    statuses.find((s) => s.state === "error" || s.state === "notFound" || s.state === "forbidden") ??
    statuses.find((s) => s.state === "loading") ?? { state: "ready" }
  );
}

/**
 * Queries that each wait on the one before, as a workflow, then its project,
 * then that project's root: the first that isn't ready. Until the one before
 * is in, a later one has nothing to ask for, so its "not found" means "not
 * yet" and mustn't win over the loading before it, as `combine` would let it.
 */
export function inTurn(...statuses: LoadStatus[]): LoadStatus {
  return statuses.find((s) => s.state !== "ready") ?? { state: "ready" };
}
