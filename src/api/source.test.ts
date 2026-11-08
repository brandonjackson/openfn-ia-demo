import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { resetFakeApi, seedEmpty, setWait } from "../fake-api";
import { apiSource, lightningAvailable, sendFor } from "./source";

// A write as the client sends it on Lightning: with Lightning's CSRF token, not the fake server's.
const write = { method: "POST", headers: { "x-csrf-token": "lightnings-token" } };

let sentToLightning: string[];

beforeEach(() => {
  setWait(0);
  resetFakeApi();
  sentToLightning = [];
  vi.stubGlobal("fetch", (path: string) => {
    sentToLightning.push(path);
    return Promise.resolve(new Response(null, { status: 204 }));
  });
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("where requests go", () => {
  it("answers everything from the fake server unless the build says otherwise", async () => {
    expect(apiSource).toBe("fake");
    expect(lightningAvailable).toBe(false);
    const send = sendFor("fake");
    expect((await send("/api/projects")).status).toBe(200);
    expect((await send("/api/demo/organization")).status).toBe(200);
    expect(sentToLightning).toEqual([]);
  });

  it("on Lightning, sends Lightning's routes to Lightning and keeps the demo's own on the fake server", async () => {
    const send = sendFor("lightning");
    await send("/api/projects?page_size=100");
    await send("/api/projects/abc/workflows");
    await send("/api/demonstrations");
    expect((await send("/api/demo/organization")).status).toBe(200);
    expect(sentToLightning).toEqual(["/api/projects?page_size=100", "/api/projects/abc/workflows", "/api/demonstrations"]);
  });

  it("on Lightning, takes the session's CSRF token on a write to the demo's own routes", async () => {
    expect((await sendFor("lightning")("/api/demo/reset", write)).status).toBe(204);
  });

  it("on Lightning, answers the demo's own routes for a project only Lightning has, starting empty", async () => {
    const lightnings = "/api/demo/projects/0b6f4a9e-3c1d-4e2f-9a7b-5c8d1e2f3a4b/components";
    // Alone, the fake server doesn't know the project.
    expect((await sendFor("fake")(lightnings)).status).toBe(403);
    expect(await (await sendFor("lightning")(lightnings)).json()).toMatchObject({ data: [] });
    const runbook = { ...write, method: "PUT", body: JSON.stringify({ component_type: "Document", name: "Runbook" }) };
    expect((await sendFor("lightning")(`${lightnings}/5e1c2b3a-4d5e-4f60-8a7b-9c0d1e2f3a4b`, runbook)).status).toBe(201);
  });

  it("on the fake server alone, still refuses a write without the fake's CSRF token", async () => {
    expect((await sendFor("fake")("/api/demo/reset", write)).status).toBe(403);
  });
});

describe("beside Lightning, the demo's own routes start empty", () => {
  beforeEach(() => seedEmpty());
  afterEach(() => seedEmpty(false));

  const read = async (path: string) => (await sendFor("lightning")(path)).json() as Promise<{ data: unknown }>;

  it("has none of the fixtures' records", async () => {
    expect((await read("/api/demo/connected_systems")).data).toEqual([]);
    expect((await read("/api/demo/services")).data).toEqual([]);
    expect((await read("/api/demo/connected_systems/channels")).data).toEqual([]);
    expect((await read("/api/demo/handbook/files")).data).toEqual([]);
    expect((await read("/api/demo/handbook")).data).toMatchObject({ attributes: { sections: [], updated_by: null, updated_at: null } });
    expect((await read("/api/demo/ecosystem")).data).toMatchObject({ attributes: { stations: [], workflows: [], corners: [] } });
    expect((await read("/api/demo/organization/xroad/directory")).data).toMatchObject({ attributes: { members: [] } });
  });

  it("starts what the demo adds to Lightning's organisation at its defaults, with no X-Road identity", async () => {
    expect((await read("/api/demo/organization")).data).toMatchObject({ attributes: { visibility: { projects: "project" }, security_server_managed_by: "this-org" } });
    expect((await sendFor("lightning")("/api/demo/organization/xroad")).status).toBe(404);
  });

  it("keeps the vocabulary that isn't anyone's records: the starter ideas and the adaptors", async () => {
    expect((await read("/api/demo/build_ideas")).data).not.toEqual([]);
    expect((await read("/api/demo/adaptors")).data).not.toEqual([]);
  });

  it("goes back to the fixtures, untouched, when switched back", async () => {
    seedEmpty(false);
    expect((await sendFor("fake")("/api/demo/organization")).status).toBe(200);
    expect((await (await sendFor("fake")("/api/demo/connected_systems")).json()).data).not.toEqual([]);
  });
});
