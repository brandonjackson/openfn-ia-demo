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

/** A query's status. A failed reload keeps what's already on screen. */
export function statusOf(query: { data: unknown; error: Error | null }): LoadStatus {
  if (query.data !== undefined) return { state: "ready" };
  if (!query.error) return { state: "loading" };
  if (isApiError(query.error, "not_found") || isApiError(query.error, "invalid_parameter")) return { state: "notFound" };
  if (isApiError(query.error, "forbidden")) return { state: "forbidden" };
  return { state: "error", message: query.error.message };
}

/** Several queries' status together: the first failure, else loading until every one is ready. */
export function combine(...statuses: LoadStatus[]): LoadStatus {
  return (
    statuses.find((s) => s.state === "error" || s.state === "notFound" || s.state === "forbidden") ??
    statuses.find((s) => s.state === "loading") ?? { state: "ready" }
  );
}
