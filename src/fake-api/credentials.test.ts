import { beforeEach, describe, expect, it } from "vitest";
import { forgetCsrfToken, request, type ApiError } from "../api/client";
import { resetFakeApi, setWait } from ".";
import { projectIdFor, sandboxIdFor } from "./projects";
import { userIdFor } from "./users";

const a = projectIdFor("project-a");
const refusal = (p: Promise<unknown>) => p.then(() => undefined, (e: unknown) => e as ApiError);
type Credential = { id: string; name: string; projects: { id: string }[]; project_credentials: { id: string; project_id: string }[]; transfer_status: string | null };
const mine = () => request<{ credentials: Credential[] }>("GET", "/api/credentials").then((r) => r.credentials);
const inProject = (id: string) => request<{ credentials: Credential[] }>("GET", `/api/projects/${id}/credentials`).then((r) => r.credentials);

const draft = {
  name: "Registry API",
  schema: "http",
  credential_bodies: [{ name: "production", body: { baseUrl: "https://registry.example.org", password: "s3cret" } }],
  project_credentials: [{ project_id: a }],
};

beforeEach(() => {
  setWait(0);
  resetFakeApi();
  forgetCsrfToken();
});

describe("credentials", () => {
  it("makes one linked to a project and its sandboxes, and never sends its secrets", async () => {
    const { credential } = await request<{ credential: Credential & Record<string, unknown> }>("POST", "/api/credentials", draft);
    expect(JSON.stringify(credential)).not.toContain("s3cret");
    expect((await inProject(a)).some((c) => c.id === credential.id)).toBe(true);
    expect((await inProject(sandboxIdFor("project-a", "intake-validation-v2"))).some((c) => c.id === credential.id)).toBe(true);
    const { data } = await request<{ data: { name: string; values: Record<string, string> }[] }>("GET", `/api/credentials/${credential.id}/environments`);
    expect(data[0]).toEqual(expect.objectContaining({ name: "production", values: { baseUrl: "https://registry.example.org" } }));
    expect((await refusal(request("POST", "/api/credentials", draft)))?.fieldErrors["name"]).toEqual(["has already been taken"]);
  });

  it("keeps a stored secret when an edit leaves it blank", async () => {
    const { credential } = await request<{ credential: Credential }>("POST", "/api/credentials", draft);
    await request("PUT", `/api/credentials/${credential.id}/environments/production`, { body: { baseUrl: "https://new.example.org", password: "" } });
    await request("PUT", `/api/credentials/${credential.id}/environments/staging`, { body: { baseUrl: "https://staging.example.org" } });
    const { data } = await request<{ data: { name: string; values: Record<string, string> }[] }>("GET", `/api/credentials/${credential.id}/environments`);
    expect(data.map((e) => e.name)).toEqual(["production", "staging"]);
    expect(data[0]!.values["baseUrl"]).toBe("https://new.example.org");
  });

  it("unlinks from a project, and deletes one that's never been used", async () => {
    const { credential } = await request<{ credential: Credential }>("POST", "/api/credentials", draft);
    await request("DELETE", `/api/projects/${a}/credentials/${credential.id}`);
    expect((await inProject(a)).some((c) => c.id === credential.id)).toBe(false);
    await request("DELETE", `/api/credentials/${credential.id}`);
    expect((await mine()).some((c) => c.id === credential.id)).toBe(false);
  });

  it("refuses to delete one that runs have used", async () => {
    // The editor's seeded credentials have been used; Jane owns "DHIS2 play".
    const used = (await mine()).find((c) => c.name === "DHIS2 play")!;
    expect((await refusal(request("DELETE", `/api/credentials/${used.id}`)))?.code).toBe("in_use");
  });

  it("transfers only to someone in every project it's in", async () => {
    const { credential } = await request<{ credential: Credential }>("POST", "/api/credentials", draft);
    const outsider = await refusal(request("PUT", `/api/credentials/${credential.id}/transfer`, { recipient: "gmwangi@example.org" }));
    expect(outsider?.errors[0]?.code).toBe("no_access");
    const pending = await request<{ credential: Credential }>("PUT", `/api/credentials/${credential.id}/transfer`, { recipient: "adiallo@example.org" });
    expect(pending.credential.transfer_status).toBe("pending");
    const revoked = await request<{ credential: Credential }>("DELETE", `/api/credentials/${credential.id}/transfer`);
    expect(revoked.credential.transfer_status).toBeNull();
  });

  it("drops a member's credential links when they leave the project", async () => {
    const amadou = userIdFor("user-amadou");
    const before = (await inProject(a)).filter((c) => c.name.startsWith("Identity API")).length;
    expect(before).toBeGreaterThan(0);
    await request("DELETE", `/api/projects/${a}/members/${amadou}`);
    expect((await inProject(a)).filter((c) => c.name.startsWith("Identity API"))).toHaveLength(0);
  });
});

describe("OAuth clients", () => {
  it("makes, changes and deletes one, never sending its secret", async () => {
    const id = crypto.randomUUID();
    const body = { name: "GitHub", client_id: "abc", client_secret: "xyz", authorization_endpoint: "https://github.com/login/oauth/authorize", token_endpoint: "https://github.com/login/oauth/access_token" };
    const made = await request<{ data: Record<string, unknown> }>("PUT", `/api/oauth_clients/${id}`, body);
    expect(made.data["client_secret"]).toBeUndefined();
    const bad = await refusal(request("PUT", `/api/oauth_clients/${id}`, { ...body, token_endpoint: "not a url" }));
    expect(bad?.fieldErrors["token_endpoint"]).toBeTruthy();
    await request("DELETE", `/api/oauth_clients/${id}`);
    const { data } = await request<{ data: { id: string }[] }>("GET", "/api/oauth_clients");
    expect(data.some((o) => o.id === id)).toBe(false);
  });
});
