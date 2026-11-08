/**
 * Where the app's requests go: the one switch between the pretend server in
 * src/fake-api/ and a real Lightning (docs/lightning-backend.md).
 *
 * Only lightning-full-api's build (`--mode lightning`, which sets
 * `VITE_API_SOURCE=lightning`) can reach a Lightning: it's served by one at
 * /v3, on the same origin and the same session. There the demo's settings
 * let you choose, at runtime, between Lightning's data and the fixtures,
 * remembered in this browser; it starts on Lightning. Built any other way
 * (dev, Storybook, tests, the Pages build) the fake server answers
 * everything, from the fixtures.
 *
 * The two never mix. On Lightning, Lightning answers everything its API has;
 * the demo's own routes, under /api/demo/, are areas Lightning doesn't have
 * yet, so the fake server goes on answering those, but starting empty
 * (`seedEmpty`), not from the fixtures. What Lightning doesn't have shows
 * empty.
 *
 * Only this file imports src/fake-api/; `client.ts` sends through `send`.
 */
import { fakeFetch, fakeFetchBesideLightning, seedEmpty } from "../fake-api";

/** What answers the app's requests. */
export type ApiSource = "fake" | "lightning";

/** Whether this build can reach a real Lightning: only lightning-full-api's. */
export const lightningAvailable = import.meta.env.VITE_API_SOURCE === "lightning";

const CHOICE_KEY = "openfn-demo:api-source";

/** The source chosen in this browser: Lightning, where the build can reach it, unless the fixtures were picked. */
function chosenSource(): ApiSource {
  if (!lightningAvailable) return "fake";
  try {
    return localStorage.getItem(CHOICE_KEY) === "fake" ? "fake" : "lightning";
  } catch {
    return "lightning";
  }
}

/** What answers this page load's requests. Fixed for the load: choosing another takes a reload. */
export const apiSource: ApiSource = chosenSource();

/**
 * Remembers which source to use from the next load on. The caller reloads:
 * everything fetched so far came from the other one.
 */
export function chooseApiSource(source: ApiSource) {
  try {
    localStorage.setItem(CHOICE_KEY, source);
  } catch {
    // Blocked: the build's default stays.
  }
}

// Beside Lightning, the demo's own routes start empty rather than from the fixtures.
if (apiSource === "lightning") seedEmpty();

type Send = (path: string, init?: RequestInit) => Promise<Response>;

/** Whether a path is one of the demo's own routes, which only the fake server has. */
const isDemoRoute = (path: string) => path === "/api/demo" || path.startsWith("/api/demo/") || path.startsWith("/api/demo?");

/** How a request reaches the given source. Takes what `fetch` takes, for a path under /api. */
export function sendFor(source: ApiSource): Send {
  if (source === "fake") return fakeFetch;
  return (path, init) => (isDemoRoute(path) ? fakeFetchBesideLightning(path, init) : fetch(path, init));
}

/** How this load's requests reach their source. */
export const send: Send = sendFor(apiSource);
