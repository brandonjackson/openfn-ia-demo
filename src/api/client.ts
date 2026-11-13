/**
 * The one way the app reaches Lightning's API (the contract is in
 * openfn-3-poc's api/ folder). Requests go out through `send`, which
 * source.ts points at the pretend server in src/fake-api/ or, in the build
 * lightning-full-api serves at /v3, at that Lightning. A refused request
 * throws an `ApiError`: show its `message`, branch on its `code`.
 */
import { FormError } from "../model/form-error";
import { send } from "./source";

/**
 * What a hook hands back for a list before it loads, or when it isn't asked for: one empty array, the
 * same every render. React tells a changed list by whether it's the same array, not by what's in it, so a
 * fresh `[]` each render reads as new data to an effect or a reset that watches it (the editor once
 * dropped a run it was in the middle of this way). Write `query.data ?? none`, never `?? []`.
 */
export const none: never[] = Object.freeze([]) as never[]; // frozen, so a caller that pushes onto it throws instead of filling every hook's empty list

type Method = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

// The session's CSRF token, which every write sends (api/authentication.md,
// session tokens). Asked for once, on the first write.
let csrfToken: Promise<string> | null = null;
const csrf = () =>
  (csrfToken ??= request<{ data: { csrf_token: string } }>("GET", "/api/session").then(
    (answer) => answer.data.csrf_token,
    (error: unknown) => {
      csrfToken = null;
      throw error;
    },
  ));

/** Sends one request and answers with its JSON body, or throws an `ApiError` for a refusal. */
export async function request<T>(method: Method, path: string, body?: unknown): Promise<T> {
  if (method === "GET") return call<T>(method, path, body, null);
  try {
    return await call<T>(method, path, body, await csrf());
  } catch (error) {
    if (isApiError(error, "forbidden")) csrfToken = null;
    throw error;
  }
}

async function call<T>(method: Method, path: string, body: unknown, token: string | null): Promise<T> {
  let response: Response;
  try {
    response = await send(path, {
      method,
      credentials: "same-origin",
      headers: {
        Accept: "application/json",
        ...(body === undefined ? {} : { "Content-Type": "application/json" }),
        ...(token ? { "x-csrf-token": token } : {}),
      },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    });
  } catch {
    throw new ApiError(0, "unreachable", "Couldn't reach Lightning.");
  }
  // 204 has no body; a proxy's error page isn't JSON.
  const json: unknown = response.status === 204 ? undefined : await response.json().catch(() => undefined);
  if (!response.ok) throw toApiError(response.status, json);
  return json as T;
}

/**
 * A file the API answers with instead of JSON (a project's YAML, a history
 * export's download). Refusals still come back as problem documents.
 * `path` may be one of Lightning's absolute links: only its path is kept, so
 * it stays on this origin.
 */
export async function getFile(path: string): Promise<Blob> {
  const url = /^https?:/.test(path) ? new URL(path) : null;
  let response: Response;
  try {
    response = await send(url ? url.pathname + url.search : path, { method: "GET", credentials: "same-origin", headers: { Accept: "*/*" } });
  } catch {
    throw new ApiError(0, "unreachable", "Couldn't reach Lightning.");
  }
  if (!response.ok) throw toApiError(response.status, await response.json().catch(() => undefined));
  return response.blob();
}

/** Every page of a paged list (api/conventions.md), following `links.next`. */
export async function listAll<T>(path: string, key = "data"): Promise<T[]> {
  const rows: T[] = [];
  let next: string | null = `${path}${path.includes("?") ? "&" : "?"}page_size=100`;
  while (next) {
    const page: Record<string, unknown> & { links?: { next: string | null } } = await request("GET", next);
    rows.push(...(page[key] as T[]));
    // Lightning's links are absolute; keep only the path, so they stay on this origin.
    const url: URL | null = page.links?.next ? new URL(page.links.next) : null;
    next = url ? url.pathname + url.search : null;
  }
  return rows;
}

/**
 * One page of a paged list (api/conventions.md), which page it is (the last,
 * when asked for one past the end) and how many rows the whole list holds.
 * Lists that send no `meta` say only which page is last, so the total is
 * read from that page: the full pages before it plus its own rows.
 */
export async function listPage<T>(path: string, page: number, pageSize: number): Promise<{ rows: T[]; page: number; total: number }> {
  type Page = { data: T[]; links: { self: string; last: string }; meta?: { total_entries: number; total_pages: number } };
  const pageOf = (link: string) => Number(new URL(link).searchParams.get("page"));
  const at = (n: number): Promise<Page> => request("GET", `${path}${path.includes("?") ? "&" : "?"}page=${n}&page_size=${pageSize}`);
  let shown = await at(page);
  const last = shown.meta ? Math.max(shown.meta.total_pages, 1) : pageOf(shown.links.last);
  // Lightning answers an empty page past the end; show the last one instead.
  if (pageOf(shown.links.self) > last) shown = await at(last);
  const served = Math.min(pageOf(shown.links.self), last);
  if (shown.meta) return { rows: shown.data, page: served, total: shown.meta.total_entries };
  const tail = last === served ? shown : await at(last);
  return { rows: shown.data, page: served, total: (last - 1) * pageSize + tail.data.length };
}

/** One entry of a problem document's `errors` (api/errors.md): a `code`, a `detail` and one location. */
export interface ProblemEntry {
  code: string;
  detail: string;
  pointer?: string;
  parameter?: string;
  header?: string;
  path?: string;
}

/**
 * A request Lightning refused. Show `message` (the problem's `detail`) and
 * branch on `code`, never on the wording. Entries with a body pointer become
 * `fieldErrors`, keyed by the pointer without `#/` (`#/name` → `name`,
 * `#/members/0/email` → `members.0.email`).
 */
export class ApiError extends FormError {
  readonly status: number;
  readonly code: string;
  readonly errors: ProblemEntry[];

  constructor(status: number, code: string, detail: string, errors: ProblemEntry[] = []) {
    const fieldErrors: Record<string, string[]> = {};
    for (const e of errors) {
      if (!e.pointer) continue;
      const key = e.pointer.replace(/^#\//, "").replaceAll("/", ".");
      (fieldErrors[key] ??= []).push(e.detail);
    }
    super(detail, fieldErrors);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.errors = errors;
  }
}

const codeForStatus: Record<number, string> = { 401: "unauthenticated", 403: "forbidden", 404: "not_found" };

/** An error status and its body (a problem document, or anything else) as an ApiError. */
export function toApiError(status: number, body: unknown): ApiError {
  const problem = (typeof body === "object" && body !== null ? body : {}) as Partial<{
    code: string;
    detail: string;
    title: string;
    errors: ProblemEntry[];
  }>;
  return new ApiError(
    status,
    problem.code ?? codeForStatus[status] ?? "internal",
    problem.detail ?? problem.title ?? `Lightning answered ${status}.`,
    Array.isArray(problem.errors) ? problem.errors : [],
  );
}

/** Lightning refused it, with this `code` if one is given (`isApiError(error, "not_found")`). */
export const isApiError = (error: unknown, code?: string): error is ApiError =>
  error instanceof ApiError && (code === undefined || error.code === code);

/** Whether asking again might help: not for a refusal (4xx), which won't change. */
export const canRetry = (error: unknown) => !(error instanceof ApiError && error.status >= 400 && error.status < 500);

/** A body field's problem as one sentence ("Name can't be blank"), for a form that shows one message. */
export function messageOf(error: unknown): string {
  if (!isApiError(error)) return error instanceof Error ? error.message : "Something went wrong.";
  const entry = error.errors[0];
  if (error.code === "invalid" && entry) {
    const field = (entry.pointer ?? entry.parameter ?? entry.path ?? "").replace(/^#\//, "").split("/").at(-1) ?? "";
    const label = field.replaceAll("_", " ");
    return label ? `${label.charAt(0).toUpperCase()}${label.slice(1)} ${entry.detail}` : entry.detail;
  }
  return error.message;
}

/** For tests that change the session behind the client's back: the next write asks for a fresh CSRF token. */
export function forgetCsrfToken() {
  csrfToken = null;
}
