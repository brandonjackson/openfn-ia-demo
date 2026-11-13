/** A project's GitHub connection, and the repos your GitHub account reaches, on Lightning's API (api/github-sync.md, api/account.md). */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { GitHubConnection, GitHubConnectionSettings, GitHubInstallation } from "../model/github-sync";
import { timeAgo } from "../model/time";
import { listAll, request, none } from "./client";
import { statusOf, type LoadStatus } from "./status";

interface ApiRepoConnection {
  attributes: { repo: string; branch: string; github_installation_id: string; config_path: string; sync_direction: "pull" | "deploy"; last_synced_at: string | null };
}
interface ApiRepo {
  full_name: string;
  default_branch: string;
  installation_id: string;
  account: string;
}

const keys = { connection: (projectId: string) => ["repo_connection", projectId] as const, repos: ["me", "github_repos"] as const };

/** The project's GitHub connection, or none. */
export function useRepoConnection(projectId: string): { status: LoadStatus; connection: GitHubConnection | undefined } {
  const query = useQuery({
    queryKey: keys.connection(projectId),
    // None is a 404: that's "not connected", not a failure.
    queryFn: () =>
      request<{ data: ApiRepoConnection }>("GET", `/api/projects/${projectId}/repo_connection`).then(
        (a) => a.data,
        (e: unknown) => {
          if ((e as { code?: string }).code === "not_found") return null;
          throw e;
        },
      ),
  });
  const c = query.data?.attributes;
  return {
    status: statusOf(query),
    connection: c && {
      installationId: c.github_installation_id,
      repo: c.repo,
      branch: c.branch,
      configPath: c.config_path.startsWith("./openfn-") ? "" : c.config_path,
      syncDirection: c.sync_direction,
      ...(c.last_synced_at && { lastSyncedAt: timeAgo(c.last_synced_at) }),
    },
  };
}

/** The GitHub installations and repos your account reaches, with each repo's branches. Only once your account is linked. */
export function useGitHubInstallations(linked: boolean): { status: LoadStatus; installations: GitHubInstallation[] } {
  const query = useQuery({
    queryKey: keys.repos,
    enabled: linked,
    queryFn: async () => {
      const repos = await listAll<ApiRepo>("/api/me/github_repos");
      const branches = await Promise.all(repos.map((r) => request<{ data: { name: string }[] }>("GET", `/api/me/github_repos/${r.full_name}/branches`).then((a) => a.data.map((b) => b.name))));
      const installations = new Map<string, GitHubInstallation>();
      repos.forEach((r, i) => {
        const inst = installations.get(r.installation_id) ?? { id: r.installation_id, account: r.account, repos: [] };
        inst.repos.push({ fullName: r.full_name, defaultBranch: r.default_branch, branches: branches[i]! });
        installations.set(r.installation_id, inst);
      });
      return [...installations.values()];
    },
  });
  return { status: linked ? statusOf(query) : { state: "ready" }, installations: query.data ?? none };
}

/** Connecting, syncing and disconnecting a project. Each resolves once the connection has reloaded. */
export function useRepoConnectionSaves(projectId: string) {
  const queryClient = useQueryClient();
  const refresh = () => Promise.all([queryClient.invalidateQueries({ queryKey: keys.connection(projectId) }), queryClient.invalidateQueries({ queryKey: ["audit_events"] })]);
  const run = useMutation({ mutationFn: (work: () => Promise<unknown>) => work(), onSuccess: refresh });
  const go = (work: () => Promise<unknown>) => run.mutateAsync(work).then(() => undefined);
  return {
    connect: (s: GitHubConnectionSettings) =>
      go(() =>
        request("PUT", `/api/projects/${projectId}/repo_connection`, {
          github_installation_id: s.installationId,
          repo: s.repo,
          branch: s.branch,
          sync_direction: s.syncDirection,
          ...(s.configPath && { config_path: s.configPath }),
        }),
      ),
    sync: () => go(() => request("POST", `/api/projects/${projectId}/repo_connection/syncs`, {})),
    disconnect: () => go(() => request("DELETE", `/api/projects/${projectId}/repo_connection`)),
  };
}
