/**
 * Your own account on Lightning's API (api/account.md, and api/users.md's
 * planned self-service): profile, email, password, API tokens, MFA, GitHub,
 * and deleting the account; and the instance's single sign-on provider
 * (api/authentication.md).
 */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRef } from "react";
import type { AuthProviderConfig, AuthProviderTest } from "../model/authentication";
import type { ApiToken, BackupCode, ContactPreference, InstanceInfo, MfaSetup, ProfileDetails, UserProfile } from "../model/account";
import { formatDate, timeAgo } from "../model/time";
import { isApiError, request } from "./client";
import { statusOf, type LoadStatus } from "./status";

/** You, as `GET /api/me` answers with a session. */
interface ApiMe {
  data: {
    id: string;
    attributes: {
      email: string;
      first_name: string;
      last_name: string;
      role: "user" | "superuser";
      mfa_enabled: boolean;
      inserted_at: string;
      contact_preference: "critical" | "any";
      pending_email: string | null;
      scheduled_deletion: string | null;
      github: { connected: boolean };
    };
  };
}

interface ApiToken_ {
  id: string;
  token: string;
  inserted_at: string;
  last_used_at: string | null;
}

interface ApiMfa {
  data: { enabled: boolean; backup_codes: { code: string; used_at: string | null }[] | null };
}

const toContact = (p: "critical" | "any"): ContactPreference => (p === "any" ? "Anytime" : "Critical only");

export const accountKeys = {
  me: ["me"] as const,
  tokens: ["me", "tokens"] as const,
  mfa: ["me", "mfa"] as const,
  authProvider: ["auth_provider"] as const,
  instance: ["instance"] as const,
};

/** GET /api/instance, with the demo's own `usage_metrics_enabled`. */
interface ApiInstance {
  url: string;
  purge_deleted_after_days: number;
  usage_metrics_enabled?: boolean;
}

/** The instance: its URL, how long deletions wait, and whether it sends usage metrics. */
export function useInstance(): { status: LoadStatus; instance: InstanceInfo | undefined } {
  const query = useQuery({
    queryKey: accountKeys.instance,
    queryFn: () => request<{ data: ApiInstance }>("GET", "/api/instance").then((a) => a.data),
    select: (i): InstanceInfo => ({ url: i.url, deletionGraceDays: i.purge_deleted_after_days, usageMetricsEnabled: i.usage_metrics_enabled ?? false }),
  });
  return { status: statusOf(query), instance: query.data };
}

/** You: your profile, and whether you're a superuser. */
export function useMe(): { status: LoadStatus; me: (UserProfile & { id: string; isSuperuser: boolean }) | undefined } {
  const query = useQuery({
    queryKey: accountKeys.me,
    queryFn: () => request<ApiMe>("GET", "/api/me"),
    select: ({ data: { id, attributes: a } }) => ({
      id,
      firstName: a.first_name,
      lastName: a.last_name,
      email: a.email,
      createdAt: formatDate(a.inserted_at),
      contactPreference: toContact(a.contact_preference),
      mfaEnabled: a.mfa_enabled,
      githubConnected: a.github.connected,
      ...(a.pending_email && { pendingEmail: a.pending_email }),
      ...(a.scheduled_deletion && { scheduledDeletion: formatDate(a.scheduled_deletion) }),
      isSuperuser: a.role === "superuser",
    }),
  });
  return { status: statusOf(query), me: query.data };
}

/** Your personal access tokens, newest first, each shown by its last characters. */
export function useApiTokens(): { status: LoadStatus; tokens: ApiToken[] } {
  const query = useQuery({
    queryKey: accountKeys.tokens,
    queryFn: () => request<{ data: ApiToken_[] }>("GET", "/api/me/tokens").then((a) => a.data),
    select: (rows) =>
      rows.map((t) => ({
        id: t.id,
        suffix: t.token.slice(-4),
        createdAt: formatDate(t.inserted_at),
        ...(t.last_used_at && { lastUsedAt: timeAgo(t.last_used_at) }),
      })),
  });
  return { status: statusOf(query), tokens: query.data ?? [] };
}

/** Your backup codes, while MFA is on. */
export function useBackupCodes(): { status: LoadStatus; backupCodes: BackupCode[] | undefined } {
  const query = useQuery({
    queryKey: accountKeys.mfa,
    queryFn: () => request<ApiMfa>("GET", "/api/me/mfa"),
    // Wrapped, so "MFA is off" (no codes) still counts as loaded.
    select: ({ data }) => ({ codes: data.backup_codes?.map((c): BackupCode => ({ code: c.code, ...(c.used_at && { usedAt: formatDate(c.used_at) }) })) }),
  });
  return { status: statusOf(query), backupCodes: query.data?.codes };
}

/**
 * Everything you can change about your own account. Each resolves once what
 * it changed has reloaded (the account menu reads `useMe` too), and rejects
 * with what the server said.
 */
export function useAccountSaves(userId: string) {
  const queryClient = useQueryClient();
  const refresh = () => queryClient.invalidateQueries({ queryKey: accountKeys.me });
  const run = useMutation({ mutationFn: (work: () => Promise<unknown>) => work(), onSuccess: refresh });
  const go = <T,>(work: () => Promise<T>) => run.mutateAsync(work) as Promise<T>;
  // The MFA secret handed out, waiting for a code from the app.
  const setup = useRef<MfaSetup>(undefined);

  return {
    saveProfile: (details: ProfileDetails) =>
      go(() =>
        request("PATCH", `/api/users/${userId}`, {
          first_name: details.firstName,
          last_name: details.lastName,
          contact_preference: details.contactPreference === "Anytime" ? "any" : "critical",
        }),
      ).then(() => undefined),
    /** Asks to change your email; it changes once you follow the link sent to the new address. */
    changeEmail: (email: string) => go(() => request("PATCH", `/api/users/${userId}`, { email })).then(() => undefined),
    changePassword: (password: string) => go(() => request("PATCH", `/api/users/${userId}`, { password })).then(() => undefined),
    /** Schedules your account's deletion. */
    deleteAccount: () => go(() => request("DELETE", `/api/users/${userId}`)).then(() => undefined),

    /** Makes a token and answers with the whole of it: the only time it's ever sent. */
    generateToken: () =>
      go(async () => {
        const { data } = await request<{ data: { token: string } }>("POST", "/api/me/tokens");
        await queryClient.invalidateQueries({ queryKey: accountKeys.tokens });
        return data.token;
      }),
    deleteToken: (id: string) =>
      go(async () => {
        await request("DELETE", `/api/me/tokens/${id}`);
        await queryClient.invalidateQueries({ queryKey: accountKeys.tokens });
      }),

    /** A new secret for an authenticator app. Nothing changes until `enableMfa` sends a code from it. */
    startMfaSetup: async (): Promise<MfaSetup> => {
      const { data } = await request<{ data: { secret: string; otpauth_uri: string } }>("POST", "/api/me/mfa");
      setup.current = { secret: data.secret, uri: data.otpauth_uri };
      return setup.current;
    },
    enableMfa: (code: string, secret = setup.current?.secret) =>
      go(async () => {
        await request("PUT", "/api/me/mfa", { secret, code });
        await queryClient.invalidateQueries({ queryKey: accountKeys.mfa });
      }),
    disableMfa: () =>
      go(async () => {
        await request("DELETE", "/api/me/mfa");
        await queryClient.invalidateQueries({ queryKey: accountKeys.mfa });
      }),
    regenerateBackupCodes: () =>
      go(async () => {
        await request("POST", "/api/me/mfa/backup_codes");
        await queryClient.invalidateQueries({ queryKey: accountKeys.mfa });
      }),

    connectGitHub: () => go(() => request("PUT", "/api/demo/me/github_connection")).then(() => undefined),
    disconnectGitHub: () => go(() => request("DELETE", "/api/me/github_connection")).then(() => undefined),
  };
}

/** The instance's single sign-on provider, or none. */
export function useAuthProvider(instanceUrl: string): { status: LoadStatus; provider: AuthProviderConfig | undefined } {
  const query = useQuery({
    queryKey: accountKeys.authProvider,
    // None set up is a 404: that's "no provider", not a failure.
    queryFn: () =>
      request<{ data: { name: string; discovery_url: string; client_id: string } }>("GET", "/api/auth_provider").then(
        (a) => a.data,
        (e: unknown) => {
          if ((e as { code?: string }).code === "not_found") return null;
          throw e;
        },
      ),
  });
  const p = query.data;
  return {
    status: statusOf(query),
    provider: p ? { name: p.name, discoveryUrl: p.discovery_url, clientId: p.client_id, hasClientSecret: true, redirectHost: instanceUrl, allowUnverifiedEmail: false } : undefined,
  };
}

/** Setting up, changing and removing single sign-on. */
export function useAuthProviderSaves() {
  const queryClient = useQueryClient();
  const refresh = () => queryClient.invalidateQueries({ queryKey: accountKeys.authProvider });
  const save = useMutation({
    mutationFn: (draft: { name: string; discoveryUrl: string; clientId: string; clientSecret?: string }) =>
      request("PUT", "/api/auth_provider", {
        name: draft.name,
        discovery_url: draft.discoveryUrl,
        client_id: draft.clientId,
        ...(draft.clientSecret && { client_secret: draft.clientSecret }),
      }),
    onSuccess: refresh,
  });
  const remove = useMutation({ mutationFn: () => request("DELETE", "/api/auth_provider"), onSuccess: refresh });
  return {
    save: async (draft: { name: string; discoveryUrl: string; clientId: string; clientSecret?: string }) => void (await save.mutateAsync(draft)),
    remove: async () => void (await remove.mutateAsync()),
    /** Checks a discovery URL answers with an OpenID configuration, without saving. The demo's own route. */
    test: async (discoveryUrl: string): Promise<AuthProviderTest> => {
      try {
        const { data } = await request<{ data: { discovery_url: string; message: string } }>("POST", "/api/demo/auth_provider/test", { discovery_url: discoveryUrl });
        return { discoveryUrl: data.discovery_url, ok: true, message: data.message };
      } catch (error) {
        // No configuration there is an answer, not a failure: the same refusal saving gives.
        if (isApiError(error, "invalid") && error.fieldErrors["discovery_url"]) return { discoveryUrl, ok: false, message: error.message };
        throw error;
      }
    },
  };
}
