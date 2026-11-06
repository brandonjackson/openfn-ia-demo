import { beforeEach, describe, expect, it } from "vitest";
import { forgetCsrfToken, request, type ApiError } from "../api/client";
import { resetFakeApi, setWait } from ".";
import { projectIdFor, sandboxIdFor } from "./projects";

const a = projectIdFor("project-a");
const refusal = (p: Promise<unknown>) => p.then(() => undefined, (e: unknown) => e as ApiError);
const body = { github_installation_id: "48211907", repo: "openfn-dtu/health-workflows", branch: "release" };

beforeEach(() => {
  setWait(0);
  resetFakeApi();
  forgetCsrfToken();
});

describe("GitHub sync", () => {
  it("needs your account linked to GitHub to connect a project", async () => {
    await request("DELETE", `/api/projects/${a}/repo_connection`);
    expect((await refusal(request("PUT", `/api/projects/${a}/repo_connection`, body)))?.code).toBe("forbidden");
    expect((await refusal(request("GET", "/api/me/github_repos")))?.code).toBe("forbidden");
  });

  it("connects, syncs and disconnects, and keeps a sandbox family off one branch", async () => {
    await request("PUT", "/api/demo/me/github_connection");
    const { data } = await request<{ data: { full_name: string }[] }>("GET", "/api/me/github_repos");
    expect(data.map((r) => r.full_name)).toContain(body.repo);
    expect((await refusal(request("PUT", `/api/projects/${a}/repo_connection`, { ...body, sync_direction: "deploy" })))?.fieldErrors["config_path"]).toBeTruthy();
    await request("PUT", `/api/projects/${a}/repo_connection`, body);
    const sandbox = sandboxIdFor("project-a", "intake-validation-v2");
    expect((await refusal(request("PUT", `/api/projects/${sandbox}/repo_connection`, body)))?.errors[0]?.code).toBe("tree_branch_conflict");
    await request("POST", `/api/projects/${a}/repo_connection/syncs`, {});
    await request("DELETE", `/api/projects/${a}/repo_connection`);
    expect((await refusal(request("GET", `/api/projects/${a}/repo_connection`)))?.code).toBe("not_found");
  });
});
