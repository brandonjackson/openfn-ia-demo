import { beforeEach, describe, expect, it } from "vitest";
import { forgetCsrfToken, request, type ApiError } from "../api/client";
import { apiServiceId, apiWorkflowId } from "../fixtures/ids";
import { apiProjectId } from "../fixtures/projects";
import { resetFakeApi, setWait, signInAs } from ".";

const refusal = (p: Promise<unknown>) => p.then(() => undefined, (e: unknown) => e as ApiError);
type Service = { id: string; attributes: { name: string; description: string; code: string; workflow_id: string | null; mcpEnabled?: boolean; xroad?: { serviceCode: string; published: boolean } } };
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

  it("publishes to X-Road under its code, turns MCP off and on, and edits its listing", async () => {
    await request("PATCH", url, { xroad: { published: true } });
    expect((await get()).xroad).toMatchObject({ published: true, serviceCode: "planning-application-intake" });
    await request("PATCH", url, { mcpEnabled: false, name: "  Apply for planning permission ", description: "Takes an application." });
    expect(await get()).toMatchObject({ mcpEnabled: false, name: "Apply for planning permission", description: "Takes an application." });
    const bad = await refusal(request("PATCH", url, { status: "Draft", name: " ", xroad: { published: true, serviceCode: "has spaces" } }));
    expect(Object.keys(bad?.fieldErrors ?? {}).sort()).toEqual(["name", "status", "xroad.serviceCode"]);
  });

  it("publishes a workflow as a service once: a listing under a code from its name", async () => {
    const services = `/api/demo/projects/${a}/services`;
    const workflow = apiWorkflowId("apply-national-id");
    const { data } = await request<{ data: Service }>("POST", services, { workflow_id: workflow, name: "Apply for a national ID", description: "Starts an application." });
    expect(data.attributes).toMatchObject({ name: "Apply for a national ID", code: "apply-for-a-national-id", workflow_id: workflow });
    const all = await request<{ data: Service[] }>("GET", "/api/demo/services?page_size=100").then((r) => r.data);
    expect(all.some((s) => s.id === data.id)).toBe(true);
    expect((await refusal(request("POST", services, { workflow_id: workflow, name: "Again" })))?.code).toBe("already_published");
    const bad = await refusal(request("POST", services, { workflow_id: apiWorkflowId("not-a-workflow"), name: "" }));
    expect(Object.keys(bad?.fieldErrors ?? {}).sort()).toEqual(["name", "workflow_id"]);
  });

  it("lets a viewer read a service but not change it", async () => {
    signInAs("user-beth");
    await expect(get()).resolves.toBeTruthy();
    expect((await refusal(request("PATCH", url, { mcpEnabled: true })))?.code).toBe("forbidden");
    expect((await refusal(request("POST", `/api/demo/projects/${a}/services`, { workflow_id: apiWorkflowId("apply-national-id"), name: "x" })))?.code).toBe("forbidden");
  });
});
