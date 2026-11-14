import { beforeEach, describe, expect, it } from "vitest";
import { forgetCsrfToken, request, type ApiError } from "../api/client";
import { apiSystemId } from "../fixtures/ids";
import { resetFakeApi, setWait } from ".";

const refusal = (p: Promise<unknown>) => p.then(() => undefined, (e: unknown) => e as ApiError);
const list = () => request<{ data: { id: string; attributes: { name: string } }[] }>("GET", "/api/demo/connected_systems?page_size=100").then((r) => r.data);

beforeEach(() => {
  setWait(0);
  resetFakeApi();
  forgetCsrfToken();
});

describe("connected systems", () => {
  it("adds a system, refusing a name that's taken or a URL that isn't one", async () => {
    const id = crypto.randomUUID();
    expect((await refusal(request("PUT", `/api/demo/connected_systems/${id}`, { name: "DHIS2", adaptor: "dhis2" })))?.fieldErrors["name"]).toEqual(["has already been taken"]);
    expect((await refusal(request("PUT", `/api/demo/connected_systems/${id}`, { name: "Lab", adaptor: "http", apiDocsUrl: "docs" })))?.fieldErrors["apiDocsUrl"]).toBeTruthy();
    expect((await refusal(request("PUT", `/api/demo/connected_systems/${id}`, { name: "Lab", adaptor: "http", openApiSpecUrl: "spec.json" })))?.fieldErrors["openApiSpecUrl"]).toBeTruthy();
    await request("PUT", `/api/demo/connected_systems/${id}`, { name: "Lab results", adaptor: "http", openApiSpecUrl: "https://lab.example.org/openapi.json" });
    expect((await list()).some((s) => s.id === id)).toBe(true);
    const added = await request<{ data: { attributes: { openApiSpecUrl?: string } } }>("GET", `/api/demo/connected_systems/${id}`);
    expect(added.data.attributes.openApiSpecUrl).toBe("https://lab.example.org/openapi.json");
  });

  it("edits a system's details and URLs, keeping what it isn't sent, and refuses a name another has", async () => {
    const dhis2 = apiSystemId("dhis2");
    type Env = { url: string; credential: string };
    const get = () =>
      request<{ data: { attributes: { name: string; description: string; adaptor: string; environments: Record<string, Env> } } }>("GET", `/api/demo/connected_systems/${dhis2}`).then((r) => r.data.attributes);
    const before = await get();
    expect((await refusal(request("PUT", `/api/demo/connected_systems/${dhis2}`, { name: "CommCare" })))?.fieldErrors["name"]).toEqual(["has already been taken"]);
    const staging = { ...before.environments["staging"]!, url: "https://staging.example.org" };
    await request("PUT", `/api/demo/connected_systems/${dhis2}`, { name: "DHIS2 national", description: "The HMIS", environments: { ...before.environments, staging } });
    expect(await get()).toMatchObject({ name: "DHIS2 national", description: "The HMIS", adaptor: before.adaptor, environments: { staging } });
    const bad = await refusal(request("PUT", `/api/demo/connected_systems/${dhis2}`, { environments: { ...before.environments, mock: { url: "nope", credential: "" } } }));
    expect(bad?.fieldErrors["environments.mock.url"]).toBeTruthy();
  });

  it("revokes one grant, and deletes a system with all its grants", async () => {
    const dhis2 = apiSystemId("dhis2");
    const grants = () => request<{ data: { id: string }[] }>("GET", `/api/demo/connected_systems/${dhis2}/access_grants`).then((r) => r.data);
    const before = await grants();
    await request("DELETE", `/api/demo/connected_systems/${dhis2}/access_grants/${before[0]!.id}`);
    expect(await grants()).toHaveLength(before.length - 1);
    await request("DELETE", `/api/demo/connected_systems/${dhis2}`);
    expect((await list()).some((s) => s.id === dhis2)).toBe(false);
    expect((await refusal(grants()))?.code).toBe("not_found");
  });
});

describe("the catalog a new system is picked from", () => {
  it("lists every adaptor, and suggests only systems not yet connected", async () => {
    type Rows = { data: { id: string; attributes: { name: string } }[] };
    const adaptors = await request<Rows>("GET", "/api/demo/adaptors?page_size=100");
    expect(adaptors.data.some((a) => a.id === "dhis2")).toBe(true);
    const before = await request<Rows>("GET", "/api/demo/connected_systems/suggestions");
    const first = before.data[0]!.attributes.name;
    await request("PUT", `/api/demo/connected_systems/${crypto.randomUUID()}`, { name: first, description: "", adaptor: "http", credentialType: "org", hasAccess: true, color: "gray", owner: "Us", ownerType: "org", environments: { production: { url: "" }, staging: { url: "" }, mock: { url: "" } } });
    const after = await request<Rows>("GET", "/api/demo/connected_systems/suggestions");
    expect(after.data.map((s) => s.attributes.name)).not.toContain(first);
  });
});

describe("the adaptor catalog", () => {
  it("sorts every adaptor into the categories the pickers show, each one in the catalog", async () => {
    type Catalog = { data: { attributes: { adaptors: { id: string }[]; categories: { groups: { adaptors: string[] }[] }[]; built_in_tools: string[] } } };
    const { data } = await request<Catalog>("GET", "/api/demo/adaptor_catalog");
    const ids = new Set(data.attributes.adaptors.map((a) => a.id));
    expect(ids.has("dhis2")).toBe(true);
    for (const id of data.attributes.categories.flatMap((c) => c.groups.flatMap((g) => g.adaptors))) expect(ids.has(id)).toBe(true);
    expect(data.attributes.built_in_tools).toContain("http");
  });
});

describe("the ecosystem map", () => {
  type Map = { data: { attributes: { stations: { id: string; name: string; kind: string }[]; workflows: { station_ids: string[] }[]; corners: { station_ids: string[] }[] } } };
  type Systems = { data: { id: string; attributes: { name: string } }[] };

  it("names each system's station by its id, and drops a deleted system with every workflow through it", async () => {
    const systems = await request<Systems>("GET", "/api/demo/connected_systems?page_size=100");
    const dhis2 = systems.data.find((s) => s.attributes.name === "DHIS2")!;
    const before = await request<Map>("GET", "/api/demo/ecosystem");
    expect(before.data.attributes.stations.find((s) => s.name === "DHIS2")?.id).toBe(dhis2.id);
    const through = before.data.attributes.workflows.filter((w) => w.station_ids.includes(dhis2.id)).length;
    expect(through).toBeGreaterThan(0);
    expect(before.data.attributes.corners.some((c) => c.station_ids.includes(dhis2.id))).toBe(true);

    await request("DELETE", `/api/demo/connected_systems/${dhis2.id}`);
    const after = await request<Map>("GET", "/api/demo/ecosystem");
    expect(after.data.attributes.stations.some((s) => s.id === dhis2.id)).toBe(false);
    expect(after.data.attributes.workflows).toHaveLength(before.data.attributes.workflows.length - through);
    expect(after.data.attributes.corners.some((c) => c.station_ids.includes(dhis2.id))).toBe(false);
  });
});

