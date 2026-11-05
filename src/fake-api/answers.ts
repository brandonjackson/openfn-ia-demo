/** How the pretend server answers: problem documents, pages, ids, timestamps. Shared by its resource files. */

/** A refusal as api/errors.md describes it. */
export interface Problem {
  status: number;
  code: string;
  detail?: string;
  errors?: Entry[];
}

/** One entry of a problem's `errors`: a code, a detail and exactly one location. */
export interface Entry {
  code: string;
  detail: string;
  pointer?: string;
  parameter?: string;
  path?: string;
  header?: string;
}

export type Body = Record<string, unknown>;
export type Params = Record<string, string>;
export type Handler = (params: Params, body: Body, query: URLSearchParams) => Response;

/** utc_datetime: whole seconds, like Lightning. */
export const now = () => new Date().toISOString().replace(/\.\d+Z$/, "Z");

const titles: Record<number, string> = {
  400: "Bad Request",
  401: "Unauthorized",
  403: "Forbidden",
  404: "Not Found",
  409: "Conflict",
  422: "Unprocessable Content",
};

export const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
export const problem = ({ status, code, detail = "The server could not complete that request.", errors }: Problem) =>
  json(status, { type: "about:blank", status, title: titles[status] ?? "Error", code, detail, ...(errors ? { errors } : {}) });
export const noContent = () => new Response(null, { status: 204 });
export const forbidden = () => problem({ status: 403, code: "forbidden", detail: "You are not allowed to do that." });
export const notFound = () => problem({ status: 404, code: "not_found", detail: "Not found." });
export const conflict = (code: string, detail: string) => problem({ status: 409, code, detail });
/** One 422 for every problem with a body (api/errors.md). */
export const invalid = (errors: Entry[]) => problem({ status: 422, code: "invalid", detail: "The request body is not valid.", errors });
/** A 400 for a path segment that isn't a UUID. */
export const badId = (path: string) =>
  problem({ status: 400, code: "invalid_parameter", detail: "A path or query parameter is not valid. See errors.", errors: [{ code: "type", detail: "is not a UUID", path }] });

export const isUuid = (id: string | undefined): id is string =>
  !!id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

// Links are absolute, like Lightning's; the client keeps only the path.
export const ORIGIN = "http://localhost:4000";

/**
 * One page of a list (api/conventions.md): `page` from 1, `page_size` 10 by
 * default and at most 100, and links that carry the query as sent.
 */
export function paged<T>(path: string, rows: T[], query: URLSearchParams, key = "data", meta = false) {
  const size = Math.min(Math.max(Number(query.get("page_size")) || 10, 1), 100);
  const last = Math.max(Math.ceil(rows.length / size), 1);
  const page = Math.min(Math.max(Number(query.get("page")) || 1, 1), last);
  const link = (n: number) => {
    const q = new URLSearchParams(query);
    q.set("page", String(n));
    q.set("page_size", String(size));
    return `${ORIGIN}${path}?${q}`;
  };
  return {
    [key]: rows.slice((page - 1) * size, page * size),
    links: { self: link(page), first: link(1), last: link(last), next: page < last ? link(page + 1) : null, prev: page > 1 ? link(page - 1) : null },
    ...(meta && { meta: { total_entries: rows.length, total_pages: last, page_number: page, page_size: size } }),
  };
}

/** A 400 for an `include` the route doesn't know (api/conventions.md). */
export function badInclude(query: URLSearchParams, known: string[]) {
  const unknown = (query.get("include") ?? "").split(",").filter((v) => v && !known.includes(v));
  return unknown.length
    ? problem({
        status: 400,
        code: "invalid_parameter",
        detail: "A path or query parameter is not valid. See errors.",
        errors: unknown.map(() => ({ code: "invalid", detail: "is not a known include", parameter: "include" })),
      })
    : undefined;
}

/** Whether `include` asks for this (`include=stats,members`). */
export const includes = (query: URLSearchParams, name: string) => (query.get("include") ?? "").split(",").includes(name);

/** An `unknown_key` entry for each key of the body the route doesn't take (api/conventions.md). */
export const unknownKeys = (body: Body, known: readonly string[], prefix = "") =>
  Object.keys(body)
    .filter((key) => !known.includes(key))
    .map((key): Entry => ({ code: "unknown_key", detail: "is not a known field", pointer: `#/${prefix}${key}` }));

/** A `required` entry when the value is missing or blank. */
export const requireString = (body: Body, key: string, errors: Entry[], prefix = "") => {
  const value = body[key];
  if (typeof value !== "string" || value.trim() === "") {
    errors.push({ code: "required", detail: "can't be blank", pointer: `#/${prefix}${key}` });
    return undefined;
  }
  return value;
};

/** A `too_long` entry when a string is longer than `max`. */
export const maxLength = (value: unknown, max: number, pointer: string, errors: Entry[]) => {
  if (typeof value === "string" && value.length > max) errors.push({ code: "too_long", detail: `should be at most ${max} character(s)`, pointer });
};
