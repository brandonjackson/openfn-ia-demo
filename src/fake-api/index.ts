/**
 * A pretend Lightning server, so the demo runs with no backend. `fakeFetch`
 * takes the same arguments as `fetch` and answers as openfn-3-poc's api/
 * says Lightning would: status codes, JSON bodies, and problem documents for
 * refusals (api/errors.md), after a short wait. Its database (db.ts) is
 * seeded from src/fixtures/ and kept in localStorage. Only src/api/source.ts
 * imports this folder; going real deletes it.
 *
 * Each resource has its own file of routes, spread into `routes` below. A route the API marks Planned is
 * answered as its spec says, with a comment saying so. Routes the API doesn't
 * describe at all (the demo's own features: connected systems, X-Road,
 * organisations…) live under /api/demo/ and follow api/conventions.md.
 */
import { noContent, problem, type Body, type Handler, type Problem } from "./answers";
import { resetDb } from "./db";
import { adoptProject } from "./projects";
import { refuse, sessionRoutes, signInAs } from "./session";
import { projectRoutes } from "./projects";
import { userRoutes } from "./user-routes";
import { auditRoutes } from "./audit";
import { workflowRoutes } from "./workflows";
import { sandboxRoutes } from "./sandboxes";
import { collectionRoutes } from "./collections";
import { webhookAuthRoutes } from "./webhook-auth";
import { historyExportRoutes } from "./history-exports";
import { provisioningRoutes } from "./provisioning";
import { credentialRoutes } from "./credentials";
import { credentialSchemaRoutes } from "./credential-schemas";
import { accountRoutes } from "./account";
import { channelRoutes } from "./channels";
import { workOrderRoutes } from "./work-orders";
import { githubRoutes } from "./github-sync";
import { systemRoutes } from "./connected-systems";
import { serviceRoutes } from "./services";
import { organizationRoutes } from "./organization";
import { handbookRoutes } from "./handbook";
import { buildIdeaRoutes } from "./build-ideas";
import { componentRoutes } from "./project-components";
import { maintenanceRoutes } from "./maintenance";

export type { Problem } from "./answers";
export { signInAs } from "./session";

/** How long each answer takes. Enough to see a pending state, short enough not to drag a demo. */
let waitMs = 120;

const routes: Record<string, Handler> = {
  ...sessionRoutes,
  ...projectRoutes,
  ...userRoutes,
  ...auditRoutes,
  ...workflowRoutes,
  ...sandboxRoutes,
  ...collectionRoutes,
  ...webhookAuthRoutes,
  ...historyExportRoutes,
  ...provisioningRoutes,
  ...credentialRoutes,
  ...credentialSchemaRoutes,
  ...accountRoutes,
  ...channelRoutes,
  ...workOrderRoutes,
  ...githubRoutes,
  ...systemRoutes,
  ...serviceRoutes,
  ...organizationRoutes,
  ...handbookRoutes,
  ...buildIdeaRoutes,
  ...maintenanceRoutes,
  ...componentRoutes,
  // The demo's own: back to the fixtures.
  "POST /api/demo/reset": () => {
    resetDb();
    return noContent();
  },
};

const compiled = new Map<string, { method: string; regex: RegExp; names: string[] }>();
function compile(key: string) {
  let found = compiled.get(key);
  if (!found) {
    const [method, pattern] = key.split(" ") as [string, string];
    const names: string[] = [];
    const regex = new RegExp("^" + pattern.replace(/:(\w+)/g, (_, name: string) => (names.push(name), "([^/]+)")) + "$");
    found = { method, regex, names };
    compiled.set(key, found);
  }
  return found;
}

/** The route a path matches (`"DELETE /api/me/tokens/:id"`) and its path parameters. Literal segments win over parameters. */
function match(method: string, path: string): [string, Record<string, string>] | undefined {
  const candidates: [string, Record<string, string>, number][] = [];
  for (const key of Object.keys(routes)) {
    const { method: m, regex, names } = compile(key);
    if (m !== method) continue;
    const found = regex.exec(path);
    if (found) candidates.push([key, Object.fromEntries(names.map((name, i) => [name, decodeURIComponent(found[i + 1]!)])), names.length]);
  }
  candidates.sort((a, b) => a[2] - b[2]);
  const best = candidates[0];
  return best && [best[0], best[1]];
}

const failures = new Map<string, Problem>();

/** Answers a request as Lightning would. Same arguments as `fetch`, for paths under /api. */
export const fakeFetch = (input: string, init: RequestInit = {}) => answer(input, init, true);

/**
 * Answers the demo's own routes (/api/demo/) for an app running on a real
 * Lightning (src/api/source.ts). The session is Lightning's, so the CSRF
 * token on a write is Lightning's too, already checked by Lightning when it
 * handed it out; this server can't check it against its own.
 */
export const fakeFetchBesideLightning = (input: string, init: RequestInit = {}) => answer(input, init, false);

async function answer(input: string, init: RequestInit, checkCsrf: boolean): Promise<Response> {
  if (waitMs > 0) await new Promise((resolve) => setTimeout(resolve, waitMs));
  const method = (init.method ?? "GET").toUpperCase();
  const [path, search = ""] = input.split("?") as [string, string?];
  // Beside Lightning, a project the demo's routes are asked about is one of Lightning's.
  const lightningProject = !checkCsrf && /^\/api\/demo\/projects\/([^/]+)/.exec(path)?.[1];
  if (lightningProject) adoptProject(decodeURIComponent(lightningProject));
  const found = match(method, path);
  // Unknown routes are a 404 problem document (api/errors.md).
  if (!found) return problem({ status: 404, code: "not_found", detail: `The fake server has no route for ${method} ${path}.` });
  const [key, params] = found;
  const refused = checkCsrf && refuse(method, new Headers(init.headers));
  if (refused) return refused;
  const failure = failures.get(key);
  if (failure) {
    failures.delete(key);
    return problem(failure);
  }
  let body: Body = {};
  if (typeof init.body === "string") {
    try {
      const parsed: unknown = JSON.parse(init.body);
      if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) throw new Error("not an object");
      body = parsed as Body;
    } catch {
      return problem({ status: 400, code: "malformed", detail: "The body is not valid JSON, or not a JSON object." });
    }
  }
  return routes[key]!(params, body, new URLSearchParams(search));
}

/** For tests and stories: the next request to this route (`"PUT /api/projects/:id"`) is refused with this problem. */
export function failNext(route: string, failure: Problem) {
  failures.set(route, failure);
}

/** For tests: answer at once instead of after a short wait. */
export function setWait(ms: number) {
  waitMs = ms;
}

/** For tests: the starting data, nothing set to fail. */
export function resetFakeApi() {
  resetDb();
  signInAs(null);
  failures.clear();
}
