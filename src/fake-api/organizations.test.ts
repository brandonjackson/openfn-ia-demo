import { beforeEach, describe, expect, it } from "vitest";
import { forgetCsrfToken, request, type ApiError } from "../api/client";
import { resetFakeApi, setWait, signInAs } from ".";

const refusal = (p: Promise<unknown>) => p.then(() => undefined, (e: unknown) => e as ApiError);
type Organization = { id: string; attributes: { name: string; role: string | null } };
type Member = { id: string; attributes: { email: string; role: string } };

const organizations = () => request<{ data: Organization[] }>("GET", "/api/organizations").then((r) => r.data);
const theOrganization = async () => (await organizations())[0]!;
const members = (id: string) => request<{ data: Member[] }>("GET", `/api/organizations/${id}/members`).then((r) => r.data);
const idOf = async (id: string, email: string) => (await members(id)).find((m) => m.attributes.email === email)!.id;

beforeEach(() => {
  setWait(0);
  resetFakeApi();
  forgetCsrfToken();
});

describe("organizations", () => {
  it("lists the ones you're in, with your role; a superuser is listed every one", async () => {
    signInAs("user-beth");
    expect((await organizations()).map((o) => o.attributes.role)).toEqual(["member"]);
    signInAs("user-priya");
    expect(await organizations()).toEqual([]);
    signInAs(null);
    const { data } = await request<{ data: Organization }>("POST", "/api/organizations", { name: "Another ministry" });
    expect(data.attributes).toMatchObject({ name: "Another ministry", role: "admin" });
    expect((await organizations()).map((o) => o.attributes.name)).toContain("Another ministry");
  });

  it("is created only by a superuser, who needs an admin in it, and refuses an email nobody has", async () => {
    signInAs("user-amadou");
    expect((await refusal(request("POST", "/api/organizations", { name: "Mine" })))?.code).toBe("forbidden");
    signInAs(null);
    const bad = await refusal(request("POST", "/api/organizations", { name: "", members: [{ email: "nobody@example.org", role: "admin" }] }));
    expect(Object.keys(bad?.fieldErrors ?? {}).sort()).toEqual(["members.0.email", "name"]);
  });

  it("is renamed by its admins, and refused to members and to anyone outside it", async () => {
    const { id } = await theOrganization();
    signInAs("user-beth");
    expect((await refusal(request("PATCH", `/api/organizations/${id}`, { name: "Renamed" })))?.code).toBe("forbidden");
    signInAs("user-priya");
    expect((await refusal(request("GET", `/api/organizations/${id}`)))?.code).toBe("forbidden");
    expect((await refusal(request("GET", "/api/organizations/not-a-uuid")))?.code).toBe("forbidden");
    signInAs("user-amadou");
    await request("PATCH", `/api/organizations/${id}`, { name: "Renamed" });
    expect((await theOrganization()).attributes.name).toBe("Renamed");
  });
});

describe("an organization's members", () => {
  it("adds someone on the instance by email, refusing an email nobody has and someone already in it", async () => {
    const { id } = await theOrganization();
    const { data } = await request<{ data: Member }>("POST", `/api/organizations/${id}/members`, { email: "PNAIR@example.org", role: "member" });
    expect(data.attributes).toMatchObject({ email: "pnair@example.org", role: "member" });
    expect((await refusal(request("POST", `/api/organizations/${id}/members`, { email: "nobody@example.org", role: "member" })))?.fieldErrors["email"]).toEqual(["names nothing you can see"]);
    expect((await refusal(request("POST", `/api/organizations/${id}/members`, { email: "jsmith@example.org", role: "admin" })))?.fieldErrors["email"]).toEqual(["is already a member of the organization"]);
  });

  it("changes roles and removes members, but always keeps an admin", async () => {
    const { id } = await theOrganization();
    const jane = await idOf(id, "jane.doe@example.org");
    const amadou = await idOf(id, "adiallo@example.org");
    await request("PATCH", `/api/organizations/${id}/members/${amadou}`, { role: "member" });
    const lastAdmin = await refusal(request("PATCH", `/api/organizations/${id}/members/${jane}`, { role: "member" }));
    expect(lastAdmin?.fieldErrors["role"]).toEqual(["would leave the organization with no admin"]);
    expect((await refusal(request("DELETE", `/api/organizations/${id}/members/${jane}`)))?.code).toBe("invalid");
    await request("DELETE", `/api/organizations/${id}/members/${amadou}`);
    expect((await members(id)).some((m) => m.id === amadou)).toBe(false);
  });

  it("lets members read the list but not change it", async () => {
    const { id } = await theOrganization();
    signInAs("user-beth");
    expect((await members(id)).length).toBeGreaterThan(0);
    expect((await refusal(request("POST", `/api/organizations/${id}/members`, { email: "pnair@example.org", role: "member" })))?.code).toBe("forbidden");
  });
});
