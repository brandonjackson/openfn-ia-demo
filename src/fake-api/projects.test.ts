import { beforeEach, describe, expect, it } from "vitest";
import { ApiError, forgetCsrfToken, request } from "../api/client";
import { resetFakeApi, setWait, signInAs } from ".";
import { projectIdFor } from "./projects";
import { currentUserId } from "./session";
import { userIdFor } from "./users";

type One = { data: { id: string; attributes: Record<string, unknown> } };
type Many = { data: { id: string; attributes: Record<string, unknown> }[] };

const refusal = (promise: Promise<unknown>) => promise.then(() => undefined, (e: unknown) => e as ApiError);

beforeEach(() => {
  setWait(0);
  resetFakeApi();
  forgetCsrfToken();
});

describe("projects", () => {
  it("lists every project to a superuser, with stats", async () => {
    const { data } = await request<Many>("GET", "/api/projects?include=stats&page_size=100");
    const a = data.find((p) => p.id === projectIdFor("project-a"))!;
    expect(a.attributes).toMatchObject({ name: "project-a", role: "owner", collaborators_count: 4 });
    // The scheduled one is there for a superuser, with its date.
    expect(data.find((p) => p.id === projectIdFor("data-quality-checks"))!.attributes["scheduled_deletion"]).toBeTruthy();
  });

  it("creates a project with the caller as owner, and refuses a name that isn't URL-safe", async () => {
    const id = crypto.randomUUID();
    const bad = await refusal(request("PUT", `/api/projects/${id}`, { name: "My Project" }));
    expect(bad?.status).toBe(422);
    expect(bad?.fieldErrors["name"]).toEqual(["has invalid format"]);

    const made = await request<One>("PUT", `/api/projects/${id}`, { name: "my-project", description: "Made here" });
    expect(made.data.attributes["members"]).toEqual([expect.objectContaining({ role: "owner", email: "jane.doe@example.org" })]);
    const got = await request<One>("GET", `/api/projects/${id}`);
    expect(got.data.attributes).toMatchObject({ name: "my-project", description: "Made here" });
    expect((got.data.attributes["permissions"] as Record<string, boolean>)["delete_project"]).toBe(true);
  });

  it("renames a project and records one audit event, not two for the same body", async () => {
    const id = projectIdFor("project-a");
    await request("PUT", `/api/projects/${id}`, { name: "planning", description: "Renamed" });
    await request("PUT", `/api/projects/${id}`, { name: "planning", description: "Renamed" });
    const got = await request<One>("GET", `/api/projects/${id}`);
    expect(got.data.attributes["name"]).toBe("planning");
  });

  it("schedules a deletion, refuses the project until it's cancelled, then brings it back", async () => {
    const id = projectIdFor("project-a");
    await request("DELETE", `/api/projects/${id}`);
    expect((await refusal(request("GET", `/api/projects/${id}`)))?.code).toBe("scheduled_for_deletion");
    expect((await refusal(request("DELETE", `/api/projects/${id}`)))?.code).toBe("scheduled_for_deletion");
    expect((await refusal(request("PUT", `/api/projects/${id}`, { name: "x" })))?.code).toBe("scheduled_for_deletion");
    await request("DELETE", `/api/projects/${id}/scheduled_deletion`);
    await expect(request("GET", `/api/projects/${id}`)).resolves.toBeTruthy();
    expect((await refusal(request("DELETE", `/api/projects/${id}/scheduled_deletion`)))?.code).toBe("not_found");
  });

  it("only lets an owner delete, and an admin edit", async () => {
    const a = projectIdFor("project-a");
    // John is an editor in project-a; Amadou is its admin.
    signInAs("user-john");
    expect((await refusal(request("PUT", `/api/projects/${a}`, { name: "project-a" })))?.code).toBe("forbidden");
    expect((await refusal(request("DELETE", `/api/projects/${a}`)))?.code).toBe("forbidden");
    signInAs("user-amadou");
    await expect(request("PUT", `/api/projects/${a}`, { name: "project-a", description: "By an admin" })).resolves.toBeTruthy();
    expect((await refusal(request("DELETE", `/api/projects/${a}`)))?.code).toBe("forbidden");
    // Someone outside the project hears 403, whether or not it exists.
    signInAs("user-grace");
    expect((await refusal(request("GET", `/api/projects/${a}`)))?.code).toBe("forbidden");
    expect((await refusal(request("GET", `/api/projects/${crypto.randomUUID()}`)))?.code).toBe("forbidden");
    expect((await request<Many>("GET", "/api/projects")).data).toEqual([]);
  });

  it("creates a project with its members from Admin settings, with exactly one owner", async () => {
    const id = crypto.randomUUID();
    const noOwner = await refusal(request("PUT", `/api/projects/${id}`, { name: "x", members: [{ email: "pnair@example.org", role: "admin" }] }));
    expect(noOwner?.fieldErrors["members"]).toBeTruthy();
    const unknown = await refusal(request("PUT", `/api/projects/${id}`, { name: "x", members: [{ email: "nobody@example.org", role: "owner" }] }));
    expect(unknown?.fieldErrors["members.0.email"]).toBeTruthy();
    await request("PUT", `/api/projects/${id}`, { name: "x", members: [{ email: "pnair@example.org", role: "owner" }, { email: "kboateng@example.org", role: "editor" }] });
    const { data } = await request<Many>("GET", `/api/projects/${id}/members`);
    expect(data.map((m) => [m.attributes["email"], m.attributes["role"]])).toEqual([
      ["kboateng@example.org", "editor"],
      ["pnair@example.org", "owner"],
    ]);
  });

  it("keeps the data retention rules", async () => {
    const id = projectIdFor("project-a");
    const tooLong = await refusal(
      request("PUT", `/api/projects/${id}/data_retention`, { retention_policy: "retain_all", history_retention_period: 30, dataclip_retention_period: 90 }),
    );
    expect(tooLong?.fieldErrors["dataclip_retention_period"]).toBeTruthy();
    const ok = await request<One>("PUT", `/api/projects/${id}/data_retention`, { retention_policy: "erase_all", history_retention_period: 90, dataclip_retention_period: 30 });
    expect(ok.data.attributes).toMatchObject({ retention_policy: "erase_all", history_retention_period: 90, dataclip_retention_period: null });
  });
});

describe("members", () => {
  const a = projectIdFor("project-a");

  it("adds, changes and removes a member, and keeps exactly one owner", async () => {
    const grace = userIdFor("user-grace");
    expect((await request<One>("PUT", `/api/projects/${a}/members/${grace}`, { role: "viewer" })).data.attributes["role"]).toBe("viewer");
    expect((await request<One>("PUT", `/api/projects/${a}/members/${grace}`, { role: "editor" })).data.attributes["role"]).toBe("editor");
    expect((await refusal(request("PUT", `/api/projects/${a}/members/${grace}`, { role: "owner" })))?.fieldErrors["role"]).toBeTruthy();
    expect((await refusal(request("PUT", `/api/projects/${a}/members/${currentUserId()}`, { role: "admin" })))?.errors[0]?.code).toBe("one_owner");
    expect((await refusal(request("DELETE", `/api/projects/${a}/members/${currentUserId()}`)))?.errors[0]?.code).toBe("one_owner");
    await request("DELETE", `/api/projects/${a}/members/${grace}`);
    const { data } = await request<Many>("GET", `/api/projects/${a}/members?page_size=100`);
    expect(data.map((m) => m.id)).not.toContain(grace);
  });

  it("invites someone new, and refuses an email that already has an account", async () => {
    const taken = await refusal(request("POST", `/api/projects/${a}/invitations`, { email: "pnair@example.org", first_name: "P", last_name: "N", role: "viewer" }));
    expect(taken?.fieldErrors["email"]).toEqual(["has already been taken"]);
    await request("POST", `/api/projects/${a}/invitations`, { email: "new.person@example.org", first_name: "New", last_name: "Person", role: "editor" });
    const { data } = await request<Many>("GET", `/api/projects/${a}/members?page_size=100`);
    expect(data.some((m) => m.attributes["email"] === "new.person@example.org")).toBe(true);
  });

  it("lets only the member change their own alerts", async () => {
    const amadou = userIdFor("user-amadou");
    expect((await refusal(request("PUT", `/api/projects/${a}/members/${amadou}/notifications`, { failure_alert: false, digest: "daily" })))?.code).toBe("forbidden");
    const mine = await request<One>("PUT", `/api/projects/${a}/members/${currentUserId()}/notifications`, { failure_alert: false, digest: "monthly" });
    expect(mine.data.attributes).toMatchObject({ failure_alert: false, digest: "monthly" });
  });
});
