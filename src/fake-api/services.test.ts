import { beforeEach, describe, expect, it } from "vitest";
import { forgetCsrfToken, request, type ApiError } from "../api/client";
import { apiServiceId } from "../fixtures/ids";
import { apiProjectId } from "../fixtures/projects";
import { resetFakeApi, setWait, signInAs } from ".";

const refusal = (p: Promise<unknown>) => p.then(() => undefined, (e: unknown) => e as ApiError);
type Service = { id: string; attributes: { status: string; mcpEnabled?: boolean; xroad?: { serviceCode: string; published: boolean } } };
const a = apiProjectId("project-a");
const intake = apiServiceId("project-a", "planning-application-intake");
const url = `/api/demo/projects/${a}/services/${intake}`;
const get = () => request<{ data: Service }>("GET", url).then((r) => r.data.attributes);

beforeEach(() => {
  setWait(0);
  resetFakeApi();
  forgetCsrfToken();
});

describe("services", () => {
  it("lists every service in the catalog and each project's own", async () => {
    const all = await request<{ data: Service[] }>("GET", "/api/demo/services?page_size=100").then((r) => r.data);
    expect(all.some((s) => s.id === intake)).toBe(true);
    const mine = await request<{ data: Service[] }>("GET", `/api/demo/projects/${a}/services`).then((r) => r.data);
    expect(mine.every((s) => all.some((x) => x.id === s.id))).toBe(true);
  });

  it("publishes to X-Road under its code, turns MCP off and on, and goes back to Draft", async () => {
    await request("PATCH", url, { xroad: { published: true } });
    expect((await get()).xroad).toMatchObject({ published: true, serviceCode: "planning-application-intake" });
    await request("PATCH", url, { mcpEnabled: false, status: "Draft" });
    expect(await get()).toMatchObject({ mcpEnabled: false, status: "Draft" });
    const bad = await refusal(request("PATCH", url, { status: "Paused", xroad: { published: true, serviceCode: "has spaces" }, colour: "red" }));
    expect(Object.keys(bad?.fieldErrors ?? {}).sort()).toEqual(["colour", "status", "xroad.serviceCode"]);
  });

  it("lets a viewer read a service but not change it", async () => {
    signInAs("user-beth");
    await expect(get()).resolves.toBeTruthy();
    expect((await refusal(request("PATCH", url, { mcpEnabled: true })))?.code).toBe("forbidden");
  });
});
