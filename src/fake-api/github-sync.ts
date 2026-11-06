/**
 * A project's GitHub connection on the pretend server (api/github-sync.md),
 * and the repos your GitHub account can reach (api/account.md). One
 * connection per project. Making it needs your account linked to GitHub;
 * owners and admins make and remove it, editors and up start a sync. A
 * family of sandboxes can't sync the same repo and branch twice.
 */
import { githubConnections, githubInstallations } from "../fixtures/project-settings";
import { projects as fixtureProjects } from "../fixtures/projects";
import { forbidden, invalid, json, noContent, notFound, now, ORIGIN, paged, unknownKeys, type Entry, type Handler } from "./answers";
import { record } from "./audit";
import { seedTime, table } from "./db";
import { findProject, guardProject, projectIdFor, rootOf } from "./projects";
import { currentUserId } from "./session";
import { findUser } from "./users";

export interface RepoConnectionRow {
  project_id: string;
  github_installation_id: string;
  repo: string;
  branch: string;
  config_path: string | null;
  sync_direction: "pull" | "deploy";
  inserted_at: string;
  updated_at: string;
  /** The demo's: when it last synced. */
  last_synced_at: string | null;
}

export const repoConnections = table<RepoConnectionRow>("repo_connections", () =>
  fixtureProjects.flatMap((p) => {
    const c = githubConnections[p.id];
    return c
      ? [
          {
            project_id: projectIdFor(p.id),
            github_installation_id: c.installationId,
            repo: c.repo,
            branch: c.branch,
            config_path: c.configPath || null,
            sync_direction: c.syncDirection,
            inserted_at: seedTime("1 Sep 2026"),
            updated_at: seedTime("1 Sep 2026"),
            last_synced_at: seedTime("just now"),
          },
        ]
      : [];
  }),
);

const entry = (c: RepoConnectionRow) => ({
  type: "repo_connections",
  id: c.project_id,
  attributes: {
    repo: c.repo,
    branch: c.branch,
    github_installation_id: c.github_installation_id,
    config_path: c.config_path ?? `./openfn-${c.project_id.slice(0, 8)}-config.json`,
    sync_direction: c.sync_direction,
    verified: true,
    problems: [],
    inserted_at: c.inserted_at,
    updated_at: c.updated_at,
    last_synced_at: c.last_synced_at,
  },
  relationships: {},
  links: { self: `${ORIGIN}/api/projects/${c.project_id}/repo_connection` },
});

const githubLinked = () => !!findUser(currentUserId())?.github_connected;
const repos = () => githubInstallations.flatMap((i) => i.repos.map((r) => ({ ...r, installation_id: i.id, account: i.account })));

export const githubRoutes: Record<string, Handler> = {
  "GET /api/projects/:project_id/repo_connection": ({ project_id }) => {
    const p = guardProject(project_id!);
    if (p instanceof Response) return p;
    const c = repoConnections.rows().find((r) => r.project_id === p.id);
    return c ? json(200, { data: entry(c) }) : notFound();
  },
  // Connects the project (or replaces its connection) and, pulling, syncs at once.
  "PUT /api/projects/:project_id/repo_connection": ({ project_id }, body) => {
    const p = guardProject(project_id!, "admin");
    if (p instanceof Response) return p;
    if (!githubLinked()) return forbidden();
    const errors: Entry[] = unknownKeys(body, ["github_installation_id", "repo", "branch", "sync_direction", "config_path"]);
    for (const key of ["github_installation_id", "repo", "branch"]) {
      if (typeof body[key] !== "string" || !(body[key] as string)) errors.push({ code: "required", detail: "can't be blank", pointer: `#/${key}` });
    }
    const direction = (body["sync_direction"] as string | undefined) ?? "pull";
    if (!["pull", "deploy"].includes(direction)) errors.push({ code: "invalid", detail: "must be pull or deploy", pointer: "#/sync_direction" });
    if (direction === "deploy" && !body["config_path"]) errors.push({ code: "required", detail: "a deploy needs the config's path", pointer: "#/config_path" });
    // A family of sandboxes can't share a repo and branch.
    const family = (id: string) => rootOf(findProject(id)!).id;
    if (repoConnections.rows().some((r) => r.project_id !== p.id && family(r.project_id) === family(p.id) && r.repo === body["repo"] && r.branch === body["branch"])) {
      errors.push({ code: "tree_branch_conflict", detail: "another project in this family syncs this branch", pointer: "#/branch" });
    }
    if (errors.length) return invalid(errors);
    const existing = repoConnections.rows().find((r) => r.project_id === p.id);
    const at = now();
    const row: RepoConnectionRow = {
      project_id: p.id,
      github_installation_id: body["github_installation_id"] as string,
      repo: body["repo"] as string,
      branch: body["branch"] as string,
      config_path: (body["config_path"] as string | undefined) || null,
      sync_direction: direction as "pull" | "deploy",
      inserted_at: existing?.inserted_at ?? at,
      updated_at: at,
      last_synced_at: at,
    };
    repoConnections.write([...repoConnections.rows().filter((r) => r.project_id !== p.id), row]);
    record("repo_connection_created", { type: "project", id: p.id, name: p.name }, { after: { repo: row.repo, branch: row.branch } });
    return json(existing ? 200 : 201, { data: entry(row) });
  },
  "DELETE /api/projects/:project_id/repo_connection": ({ project_id }) => {
    const p = guardProject(project_id!, "admin");
    if (p instanceof Response) return p;
    if (!repoConnections.rows().some((r) => r.project_id === p.id)) return notFound();
    repoConnections.remove((r) => r.project_id === p.id);
    record("repo_connection_removed", { type: "project", id: p.id, name: p.name }, {}, true);
    return noContent();
  },
  // Each call starts a new sync; the demo's is done at once.
  "POST /api/projects/:project_id/repo_connection/syncs": ({ project_id }) => {
    const p = guardProject(project_id!, "editor");
    if (p instanceof Response) return p;
    if (!repoConnections.rows().some((r) => r.project_id === p.id)) return notFound();
    repoConnections.update((r) => r.project_id === p.id, (r) => ({ ...r, last_synced_at: now() }));
    return new Response(null, { status: 202 });
  },

  // The repos your GitHub account can reach, by name; with no GitHub account linked, 403.
  "GET /api/me/github_repos": (_params, _body, query) => {
    if (!githubLinked()) return forbidden();
    const rows = repos()
      .map((r) => ({ full_name: r.fullName, default_branch: r.defaultBranch, installation_id: r.installation_id, account: r.account }))
      .sort((a, b) => a.full_name.localeCompare(b.full_name));
    return json(200, paged("/api/me/github_repos", rows, query));
  },
  "GET /api/me/github_repos/:owner/:name/branches": ({ owner, name }) => {
    if (!githubLinked()) return forbidden();
    const repo = repos().find((r) => r.fullName === `${owner}/${name}`);
    return repo ? json(200, { data: repo.branches.map((b) => ({ name: b })) }) : notFound();
  },
};
