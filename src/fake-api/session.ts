/**
 * Who is signed in to the fake server, and the session's CSRF token
 * (api/authentication.md, session tokens). The demo is always signed in, as
 * the fixtures' current user; every write must carry the token, as it would
 * on Lightning.
 */
import { currentUser } from "../fixtures/user";
import { instanceUsers } from "../fixtures/admin";
import { json, problem, type Handler } from "./answers";
import { seedId } from "../fixtures/ids";

const CSRF_TOKEN = "demo-csrf-token";

/** The signed-in person's email: the key the fake server finds them by. */
export const currentEmail = () => currentUser.email;

const signedIn = instanceUsers.find((u) => u.email === currentUser.email);
let actingAs: string | null = null;

/** The signed-in person's id: the users table's id for the fixtures' current user. */
export const currentUserId = () => actingAs ?? seedId("user", signedIn?.id ?? currentUser.email);

/** For tests: act as another fixture user ("user-john"), or as the current user again with null. */
export function signInAs(fixtureUserId: string | null) {
  actingAs = fixtureUserId && seedId("user", fixtureUserId);
}

/** A write without the session's CSRF token is refused, as Lightning refuses it. */
export function refuse(method: string, headers: Headers): Response | undefined {
  if (method === "GET") return undefined;
  if (headers.get("x-csrf-token") !== CSRF_TOKEN) {
    return problem({ status: 403, code: "forbidden", detail: "The request is missing the session's CSRF token." });
  }
  return undefined;
}

export const sessionRoutes: Record<string, Handler> = {
  "GET /api/session": () =>
    json(200, { data: { state: "signed_in", user_id: currentUserId(), stepped_up_until: null, csrf_token: CSRF_TOKEN, pending_signup: null } }),
};
