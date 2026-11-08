/**
 * Your own account on the pretend server (api/account.md, api/users.md's
 * planned self-service): who you are, your personal access tokens, MFA and
 * its backup codes, your GitHub link, and the instance's single sign-on
 * provider (api/authentication.md).
 *
 * The demo's session counts as stepped up: Lightning asks for your password
 * or a code again before you make a token, turn MFA off, change your email
 * or delete your account, and the demo has no screen for that yet.
 */
import { userApiTokens, demoBackupCodes, currentUser, currentInstance } from "../fixtures/user";
import { deletionGraceDays, instanceAuthProvider, instanceUrl, usageMetricsEnabled } from "../fixtures/admin";
import { newId, seedId } from "../fixtures/ids";
import { conflict, forbidden, invalid, json, noContent, notFound, now, problem, unknownKeys, type Body, type Entry, type Handler } from "./answers";
import { diff, record } from "./audit";
import { seedTime, table } from "./db";
import { currentUserId } from "./session";
import { findUser, findUserByEmail, userEntry, userIdFor, users, type UserRow } from "./users";

interface TokenRow {
  id: string;
  user_id: string;
  /** Lightning keeps only enough to show: "..." and the last ten characters. */
  token: string;
  inserted_at: string;
  last_used_at: string | null;
}

interface BackupCodeRow {
  user_id: string;
  code: string;
  used_at: string | null;
}

interface AuthProviderRow {
  name: string;
  discovery_url: string;
  client_id: string;
  client_secret: string;
  inserted_at: string;
  updated_at: string;
}

const jane = () => userIdFor("user-jane");

export const tokens = table<TokenRow>("api_tokens", () =>
  userApiTokens.map((t) => ({
    id: seedId("api_token", t.id),
    user_id: jane(),
    token: `...demo00${t.suffix}`,
    inserted_at: seedTime(t.createdAt),
    last_used_at: t.lastUsedAt ? seedTime(t.lastUsedAt) : null,
  })),
);

export const backupCodes = table<BackupCodeRow>("backup_codes", () =>
  currentUser.mfaEnabled ? demoBackupCodes.map((c) => ({ user_id: jane(), code: c.code, used_at: c.usedAt ? seedTime(c.usedAt) : null })) : [],
);

export const authProvider = table<AuthProviderRow>("auth_provider", () =>
  instanceAuthProvider
    ? [
        {
          name: instanceAuthProvider.name,
          discovery_url: instanceAuthProvider.discoveryUrl,
          client_id: instanceAuthProvider.clientId,
          client_secret: "demo-secret-not-real",
          inserted_at: seedTime("1 Jan 2026"),
          updated_at: seedTime("1 Jan 2026"),
        },
      ]
    : [],
);

const BASE32 = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
const random = (length: number, alphabet: string) => Array.from(crypto.getRandomValues(new Uint8Array(length)), (b) => alphabet[b % alphabet.length]).join("");
/** Ten fresh backup codes, as Lightning makes them. */
const newCodes = (userId: string) => Array.from({ length: 10 }, () => ({ user_id: userId, code: random(9, BASE32.replace("O", "")), used_at: null }));

/** The authenticator secret handed out by `POST /api/me/mfa`, waiting for a code. Not saved, as in Lightning. */
let pendingSecret: string | null = null;

const me = () => findUser(currentUserId())!;
const isSuperuser = () => me().role === "superuser";

/** You, as `GET /api/me` answers with a session: the user and its extras. */
function meEntry(u: UserRow) {
  const entry = userEntry(u);
  return {
    data: {
      ...entry,
      attributes: {
        ...entry.attributes,
        mfa_enabled: u.mfa_enabled,
        has_password: true,
        inserted_at: u.inserted_at,
        contact_preference: u.contact_preference,
        pending_email: u.pending_email,
        github: { connected: u.github_connected, expires_at: null },
      },
    },
  };
}

const mfaEntry = (u: UserRow) => ({
  data: {
    enabled: u.mfa_enabled,
    backup_codes: u.mfa_enabled ? backupCodes.rows().filter((c) => c.user_id === u.id).map((c) => ({ code: c.code, used_at: c.used_at })) : null,
  },
});

/**
 * Your own changes to your account, through `PATCH /api/users/:id` on your own
 * id; the superuser's edit of anyone is in user-routes.ts. All of it is
 * planned in api/users.md; the lightning-full-api fork takes your names and
 * contact preference ahead of Lightning's main (docs/api-gaps.md).
 */
export function updateSelf(body: Body): Response {
  const u = me();
  const errors: Entry[] = unknownKeys(body, ["first_name", "last_name", "contact_preference", "email", "password"]);
  for (const key of ["first_name", "last_name"]) {
    if (body[key] !== undefined && (typeof body[key] !== "string" || !(body[key] as string).trim())) errors.push({ code: "required", detail: "can't be blank", pointer: `#/${key}` });
  }
  if (body["contact_preference"] !== undefined && !["critical", "any"].includes(body["contact_preference"] as string)) {
    errors.push({ code: "not_allowed", detail: "is invalid", pointer: "#/contact_preference" });
  }
  const email = typeof body["email"] === "string" ? body["email"].trim() : undefined;
  if (email !== undefined) {
    if (!/^[^\s@]+@[^\s@]+$/.test(email)) errors.push({ code: "format", detail: "must have the @ sign and no spaces", pointer: "#/email" });
    else if (email === u.email) errors.push({ code: "unchanged", detail: "did not change", pointer: "#/email" });
    else if (findUserByEmail(email)) errors.push({ code: "taken", detail: "has already been taken", pointer: "#/email" });
  }
  const password = body["password"];
  if (password !== undefined && (typeof password !== "string" || password.length < 12 || password.length > 72)) {
    errors.push({ code: "too_short", detail: "should be 12 to 72 character(s)", pointer: "#/password" });
  }
  if (errors.length) return invalid(errors);
  const names = {
    ...(typeof body["first_name"] === "string" && { first_name: body["first_name"].trim() }),
    ...(typeof body["last_name"] === "string" && { last_name: body["last_name"].trim() }),
  };
  // A new email waits for its confirmation link; until then it's pending.
  users.update(
    (r) => r.id === u.id,
    (r) => ({
      ...r,
      ...names,
      ...(body["contact_preference"] !== undefined && { contact_preference: body["contact_preference"] as UserRow["contact_preference"] }),
      ...(email !== undefined && { pending_email: email }),
    }),
  );
  // Lightning records a change to your names, with you as the actor.
  record("updated", { type: "user", id: u.id, name: u.email }, diff(u as unknown as Record<string, unknown>, names));
  return json(200, { data: userEntry(findUser(u.id)!) });
}

export const accountRoutes: Record<string, Handler> = {
  "GET /api/instance": () =>
    // name and usage_metrics_enabled are the demo's own fields (docs/api-gaps.md).
    json(200, {
      data: { needs_setup: false, allow_signup: false, name: currentInstance.name, url: instanceUrl, purge_deleted_after_days: deletionGraceDays, admin_email: "support@example.org", github_sync: true, usage_metrics_enabled: usageMetricsEnabled },
    }),

  "GET /api/me": () => json(200, meEntry(me())),

  /* ---------------- Tokens ---------------- */

  // Newest first, masked, not paged.
  "GET /api/me/tokens": () =>
    json(200, {
      data: tokens
        .rows()
        .filter((t) => t.user_id === me().id)
        .sort((a, b) => b.inserted_at.localeCompare(a.inserted_at))
        .map(({ user_id: _owner, ...t }) => (void _owner, t)),
    }),
  // The whole token, this once; the list keeps only its mask.
  "POST /api/me/tokens": () => {
    const whole = `ofn_pat_demo_${random(40, "0123456789abcdef")}`;
    const made = { id: newId(), user_id: me().id, token: `...${whole.slice(-10)}`, inserted_at: now(), last_used_at: null };
    tokens.insert(made);
    record("token_issued", { type: "user", id: me().id, name: me().email }, {}, true);
    return json(201, { data: { id: made.id, token: whole, inserted_at: made.inserted_at, last_used_at: null } });
  },
  "DELETE /api/me/tokens/:id": ({ id }) => {
    if (!tokens.rows().some((t) => t.id === id && t.user_id === me().id)) return notFound();
    tokens.remove((t) => t.id === id);
    return noContent();
  },

  /* ---------------- MFA ---------------- */

  "GET /api/me/mfa": () => json(200, mfaEntry(me())),
  // A new secret for an authenticator app. Nothing is saved until a code from it comes back.
  "POST /api/me/mfa": () => {
    pendingSecret = random(32, BASE32);
    const label = encodeURIComponent(`OpenFn:${me().email}`);
    return json(201, { data: { secret: pendingSecret, otpauth_uri: `otpauth://totp/${label}?secret=${pendingSecret}&issuer=OpenFn` } });
  },
  // Turns MFA on (or moves it to the new app) with a code from it. There's no real authenticator behind the demo, so any six digits will do.
  "PUT /api/me/mfa": (_params, body) => {
    const errors: Entry[] = [];
    if (typeof body["secret"] !== "string" || body["secret"] !== pendingSecret) errors.push({ code: "mismatch", detail: "start setting up MFA again", pointer: "#/secret" });
    if (typeof body["code"] !== "string" || !/^\d{6}$/.test(body["code"])) errors.push({ code: "mismatch", detail: "is not a valid code", pointer: "#/code" });
    if (errors.length) return invalid(errors);
    pendingSecret = null;
    const u = me();
    if (!u.mfa_enabled) {
      users.update((r) => r.id === u.id, (r) => ({ ...r, mfa_enabled: true }));
      backupCodes.remove((c) => c.user_id === u.id);
      for (const c of newCodes(u.id)) backupCodes.insert(c);
    }
    return json(200, mfaEntry(findUser(u.id)!));
  },
  "DELETE /api/me/mfa": () => {
    const u = me();
    users.update((r) => r.id === u.id, (r) => ({ ...r, mfa_enabled: false }));
    backupCodes.remove((c) => c.user_id === u.id);
    return noContent();
  },
  "POST /api/me/mfa/backup_codes": () => {
    const u = me();
    if (!u.mfa_enabled) return conflict("not_ready", "Turn MFA on first.");
    backupCodes.remove((c) => c.user_id === u.id);
    for (const c of newCodes(u.id)) backupCodes.insert(c);
    return json(201, mfaEntry(u));
  },

  /* ---------------- GitHub ---------------- */

  // In Lightning, linking is a trip through GitHub's sign-in; the demo's stands in for its return.
  "PUT /api/demo/me/github_connection": () => {
    users.update((r) => r.id === me().id, (r) => ({ ...r, github_connected: true }));
    return json(200, meEntry(me()));
  },
  "DELETE /api/me/github_connection": () => {
    users.update((r) => r.id === me().id, (r) => ({ ...r, github_connected: false }));
    return noContent();
  },

  /* ---------------- Single sign-on (superuser) ---------------- */

  "GET /api/auth_provider": () => {
    if (!isSuperuser()) return forbidden();
    const p = authProvider.rows()[0];
    if (!p) return notFound();
    const { client_secret: _secret, ...shown } = p;
    void _secret;
    return json(200, { data: { ...shown, redirect_uri: `${instanceUrl}/authenticate/${p.name}/callback` } });
  },
  // The demo's own route: api/ checks a discovery URL only as it saves (docs/api-gaps.md).
  "POST /api/demo/auth_provider/test": (_params, body) => {
    if (!isSuperuser()) return forbidden();
    const url = body["discovery_url"];
    if (typeof url !== "string" || !url) return invalid([{ code: "required", detail: "can't be blank", pointer: "#/discovery_url" }]);
    // Refused as PUT /api/auth_provider refuses it, so the form reads both the same way.
    if (!/^https:\/\/.+\/\.well-known\/openid-configuration$/.test(url)) {
      return problem({
        status: 422,
        code: "invalid",
        detail: "No OpenID configuration at that URL. Check it's HTTPS and ends in .well-known/openid-configuration.",
        errors: [{ code: "discovery_failed", detail: "has no OpenID configuration", pointer: "#/discovery_url" }],
      });
    }
    return json(200, { data: { discovery_url: url, message: "Found the provider's authorization, token and user info endpoints." } });
  },
  "PUT /api/auth_provider": (_params, body) => {
    if (!isSuperuser()) return forbidden();
    const existing = authProvider.rows()[0];
    const errors: Entry[] = unknownKeys(body, ["name", "discovery_url", "client_id", "client_secret"]);
    if (typeof body["name"] !== "string" || !/^[a-z0-9_-]+$/.test(body["name"])) errors.push({ code: "format", detail: "must be lowercase letters, digits, - and _", pointer: "#/name" });
    if (typeof body["client_id"] !== "string" || !body["client_id"]) errors.push({ code: "required", detail: "can't be blank", pointer: "#/client_id" });
    if (!existing && (typeof body["client_secret"] !== "string" || !body["client_secret"])) errors.push({ code: "required", detail: "can't be blank", pointer: "#/client_secret" });
    const url = body["discovery_url"];
    // Lightning fetches the discovery document before saving; the demo checks it looks like one.
    if (typeof url !== "string" || !/^https:\/\/.+\/\.well-known\/openid-configuration$/.test(url)) {
      errors.push({ code: "discovery_failed", detail: "has no OpenID configuration", pointer: "#/discovery_url" });
    }
    if (errors.length) return invalid(errors);
    const at = now();
    authProvider.write([
      {
        name: body["name"] as string,
        discovery_url: url as string,
        client_id: body["client_id"] as string,
        client_secret: (body["client_secret"] as string | undefined) || existing?.client_secret || "",
        inserted_at: existing?.inserted_at ?? at,
        updated_at: at,
      },
    ]);
    return json(existing ? 200 : 201, { data: { name: body["name"], discovery_url: url, client_id: body["client_id"] } });
  },
  "DELETE /api/auth_provider": () => {
    if (!isSuperuser()) return forbidden();
    authProvider.write([]);
    return noContent();
  },
};
