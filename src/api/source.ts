/**
 * Where the app's requests go: the one switch between the pretend server in
 * src/fake-api/ and a real Lightning (docs/lightning-backend.md).
 *
 * Built with `VITE_API_SOURCE=lightning`, which only lightning-full-api's
 * build sets, the app is served by a Lightning at /v3 and sends its requests
 * there, on the same origin and the same session. The demo's own routes,
 * under /api/demo/, are areas Lightning's API doesn't have yet, so the fake
 * server goes on answering those. Built any other way (dev, Storybook,
 * tests, the Pages build), the fake server answers everything.
 *
 * Only this file imports src/fake-api/; `client.ts` sends through `send`.
 */
import { fakeFetch, fakeFetchBesideLightning } from "../fake-api";

/** What answers the app's requests. */
export type ApiSource = "fake" | "lightning";

/** The source this build was made for. */
export const apiSource: ApiSource = import.meta.env.VITE_API_SOURCE === "lightning" ? "lightning" : "fake";

type Send = (path: string, init?: RequestInit) => Promise<Response>;

/** Whether a path is one of the demo's own routes, which only the fake server has. */
const isDemoRoute = (path: string) => path === "/api/demo" || path.startsWith("/api/demo/") || path.startsWith("/api/demo?");

/** How a request reaches the given source. Takes what `fetch` takes, for a path under /api. */
export function sendFor(source: ApiSource): Send {
  if (source === "fake") return fakeFetch;
  return (path, init) => (isDemoRoute(path) ? fakeFetchBesideLightning(path, init) : fetch(path, init));
}

/** How this build's requests reach their source. */
export const send: Send = sendFor(apiSource);
