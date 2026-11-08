import { beforeEach, describe, expect, it } from "vitest";
import { forgetCsrfToken, request, type ApiError } from "../api/client";
import { resetFakeApi, setWait, signInAs } from ".";

const refusal = (p: Promise<unknown>) => p.then(() => undefined, (e: unknown) => e as ApiError);
type Member = { id: string; attributes: { email: string; name: string; role: string; joined_at: string | null } };
const members = () => request<{ data: Member[] }>("GET", "/api/demo/organization/members").then((r) => r.data);
const byEmail = async (email: string) => (await members()).find((m) => m.attributes.email === email)!;

beforeEach(() => {
  setWait(0);
  resetFakeApi();
  forgetCsrfToken();
});

describe("organisation members", () => {
  it("invites someone new (waiting) and someone on the instance (joined), refusing an email that's taken", async () => {
    await request("POST", "/api/demo/organization/members", { email: "new.person@example.org", role: "Member" });
    expect((await byEmail("new.person@example.org")).attributes.joined_at).toBeNull();
    await request("POST", "/api/demo/organization/members", { email: "pnair@example.org", role: "Admin" });
    expect((await byEmail("pnair@example.org")).attributes).toMatchObject({ role: "Admin", name: expect.not.stringContaining("@") });
    const taken = await refusal(request("POST", "/api/demo/organization/members", { email: "JSMITH@example.org" }));
    expect(taken?.fieldErrors["email"]).toEqual(["is already in the organisation"]);
  });

  it("changes roles and removes members, but always keeps an owner", async () => {
    const jane = await byEmail("jane.doe@example.org");
    expect((await refusal(request("PATCH", `/api/demo/organization/members/${jane.id}`, { role: "Admin" })))?.code).toBe("last_owner");
    expect((await refusal(request("DELETE", `/api/demo/organization/members/${jane.id}`)))?.code).toBe("last_owner");
    const amadou = await byEmail("adiallo@example.org");
    await request("PATCH", `/api/demo/organization/members/${amadou.id}`, { role: "Owner" });
    const john = await byEmail("jsmith@example.org");
    await request("DELETE", `/api/demo/organization/members/${john.id}`);
    expect((await members()).some((m) => m.id === john.id)).toBe(false);
    await request("PATCH", `/api/demo/organization/members/${jane.id}`, { role: "Member" });
    expect((await byEmail("jane.doe@example.org")).attributes.role).toBe("Member");
    // Now a member, Jane can no longer change anyone.
    expect((await refusal(request("DELETE", `/api/demo/organization/members/${amadou.id}`)))?.code).toBe("forbidden");
  });

  it("lets admins manage members but not owners, and members only read", async () => {
    signInAs("user-amadou");
    const jane = await byEmail("jane.doe@example.org");
    expect((await refusal(request("PATCH", `/api/demo/organization/members/${jane.id}`, { role: "Member" })))?.code).toBe("forbidden");
    expect((await refusal(request("POST", "/api/demo/organization/members", { email: "x@example.org", role: "Owner" })))?.code).toBe("forbidden");
    await request("POST", "/api/demo/organization/members", { email: "x@example.org", role: "Admin" });
    signInAs("user-beth");
    await expect(members()).resolves.toBeTruthy();
    expect((await refusal(request("POST", "/api/demo/organization/members", { email: "y@example.org" })))?.code).toBe("forbidden");
  });
});

describe("organisation settings", () => {
  it("saves visibility defaults and who manages the Security Server, refusing values it doesn't know", async () => {
    await request("PATCH", "/api/demo/organization", { visibility: { services: "organization" }, security_server_managed_by: "partner" });
    const { data } = await request<{ data: { attributes: { visibility: Record<string, string>; security_server_managed_by: string } } }>("GET", "/api/demo/organization");
    expect(data.attributes.visibility["services"]).toBe("organization");
    expect(data.attributes.security_server_managed_by).toBe("partner");
    const bad = await refusal(request("PATCH", "/api/demo/organization", { visibility: { projects: "everyone" }, security_server_managed_by: "nobody" }));
    expect(Object.keys(bad?.fieldErrors ?? {}).sort()).toEqual(["security_server_managed_by", "visibility.projects"]);
  });

  it("requests a context layer by URL, refuses one it already has, and removes it", async () => {
    const layers = () => request<{ data: { id: string; attributes: { url: string; status: string } }[] }>("GET", "/api/demo/organization/context_layers").then((r) => r.data);
    const { data } = await request<{ data: { id: string; attributes: { status: string; name: string } } }>("POST", "/api/demo/organization/context_layers", { url: "https://context.example.org/health" });
    expect(data.attributes).toMatchObject({ status: "pending", name: "context.example.org" });
    expect((await refusal(request("POST", "/api/demo/organization/context_layers", { url: "https://context.example.org/health" })))?.fieldErrors["url"]).toBeTruthy();
    expect((await refusal(request("POST", "/api/demo/organization/context_layers", { url: "not a url" })))?.fieldErrors["url"]).toBeTruthy();
    await request("DELETE", `/api/demo/organization/context_layers/${data.id}`);
    expect((await layers()).some((l) => l.id === data.id)).toBe(false);
  });
});

describe("the organisation's X-Road identity", () => {
  it("is read only, with times as timestamps, and takes who manages the Security Server from the organisation", async () => {
    type Identity = { data: { attributes: Record<string, unknown> & { certificates: { expires_at: string }[]; security_servers: { last_seen_at: string }[] } } };
    const { data } = await request<Identity>("GET", "/api/demo/organization/xroad");
    expect(data.attributes).toMatchObject({ instance: expect.any(String), member_class: expect.any(String), member_code: expect.any(String) });
    expect(data.attributes).not.toHaveProperty("security_server_managed_by");
    expect(Number.isNaN(Date.parse(data.attributes.certificates[0]!.expires_at))).toBe(false);
    expect(Number.isNaN(Date.parse(data.attributes.security_servers[0]!.last_seen_at))).toBe(false);
    expect((await refusal(request("PATCH", "/api/demo/organization/xroad", { member_code: "X" })))?.status).toBe(404);
  });
});

describe("the X-Road directory", () => {
  it("lists every member on the organisation's instance, read only, with when it was last listed", async () => {
    type Directory = { data: { attributes: { instance: string; synced_at: string; members: { id: string; member_code: string; subsystems: { services: { code: string; methods: string[] }[] }[] }[] } } };
    const identity = await request<{ data: { attributes: { instance: string } } }>("GET", "/api/demo/organization/xroad");
    const { data } = await request<Directory>("GET", "/api/demo/organization/xroad/directory");
    expect(data.attributes.instance).toBe(identity.data.attributes.instance);
    expect(Number.isNaN(Date.parse(data.attributes.synced_at))).toBe(false);
    const moi = data.attributes.members.find((m) => m.member_code === "MOI")!;
    expect(moi.subsystems.flatMap((s) => s.services.map((v) => v.code))).toContain("verify-national-id");
    expect((await refusal(request("POST", "/api/demo/organization/xroad/directory", {})))?.status).toBe(404);
  });
});
