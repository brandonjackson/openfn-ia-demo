import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { resetFakeApi, setWait } from "../fake-api";
import { apiSource, sendFor } from "./source";

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
