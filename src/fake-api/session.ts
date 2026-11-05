/**
 * Who is signed in to the fake server, and the session's CSRF token
 * (api/authentication.md, session tokens). The demo is always signed in, as
 * the fixtures' current user; every write must carry the token, as it would
 * on Lightning.
 */
import { currentUser } from "../fixtures/user";
import { json, problem, type Handler } from "./answers";
import { seedId } from "./ids";

const CSRF_TOKEN = "demo-csrf-token";

/** The signed-in person's email: the key the fake server finds them by. */
export const currentEmail = () => currentUser.email;

/** The signed-in person's id. */
export const currentUserId = () => seedId("user", currentUser.email);

/** A write without the session's CSRF token is refused, as Lightning refuses it. */
export function refuse(method: string, headers: Headers): Response | undefined {
  if (method === "GET") return undefined;
  if (headers.get("x-csrf-token") !== CSRF_TOKEN) {
    return problem({ status: 403, code: "forbidden", detail: "The request is missing the session's CSRF token." });
  }
  return undefined;
}

export const sessionRoutes: Record<string, Handler> = {
  "GET /api/session": () => json(200, { data: { csrf_token: CSRF_TOKEN, user_id: currentUserId() } }),
};
