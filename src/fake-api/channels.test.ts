import { beforeEach, describe, expect, it } from "vitest";
import { forgetCsrfToken, request, type ApiError } from "../api/client";
import { resetFakeApi, setWait, signInAs } from ".";
import { projectIdFor } from "./projects";

const a = projectIdFor("project-a");
const refusal = (p: Promise<unknown>) => p.then(() => undefined, (e: unknown) => e as ApiError);
type Channel = { id: string; attributes: Record<string, unknown> };
const list = () => request<{ data: Channel[]; meta: { total_channels: number } }>("GET", `/api/projects/${a}/channels`);

beforeEach(() => {
  setWait(0);
  resetFakeApi();
  forgetCsrfToken();
});

describe("channels", () => {
  it("lists a project's seeded channels with their traffic", async () => {
    const { data, meta } = await list();
    expect(meta.total_channels).toBe(data.length);
    expect(data.some((c) => (c.attributes["request_count"] as number) > 0)).toBe(true);
  });

  it("makes, changes (bumping its version) and deletes a channel with its requests", async () => {
    const id = crypto.randomUUID();
    const body = { name: "DHIS2 proxy", destination_url: "https://dhis2.example.org/api", channel_type: "read", system: { name: "DHIS2", adaptor: "dhis2" } };
    expect((await refusal(request("PUT", `/api/projects/${a}/channels/${id}`, { ...body, destination_url: "ftp://nope" })))?.fieldErrors["destination_url"]).toBeTruthy();
    const made = await request<{ data: Channel }>("PUT", `/api/projects/${a}/channels/${id}`, body);
    expect(made.data.attributes["lock_version"]).toBe(1);
    const changed = await request<{ data: Channel }>("PUT", `/api/projects/${a}/channels/${id}`, { enabled: false, lock_version: 1 });
    expect(changed.data.attributes).toMatchObject({ enabled: false, lock_version: 2 });
    expect((await refusal(request("PUT", `/api/projects/${a}/channels/${id}`, { enabled: true, lock_version: 1 })))?.code).toBe("concurrent_edit");
    const other = crypto.randomUUID();
    expect((await refusal(request("PUT", `/api/projects/${a}/channels/${other}`, { ...body })))?.fieldErrors["name"]).toEqual(["has already been taken"]);
    await request("DELETE", `/api/projects/${a}/channels/${id}`);
    expect((await list()).data.some((c) => c.id === id)).toBe(false);
  });

  it("deletes a channel's recorded requests with it", async () => {
    const busy = (await list()).data.find((c) => (c.attributes["request_count"] as number) > 0)!;
    await request("DELETE", `/api/projects/${a}/channels/${busy.id}`);
    const { data } = await request<{ data: unknown[] }>("GET", `/api/projects/${a}/channel_requests?channel_id=${busy.id}`);
    expect(data).toEqual([]);
  });

  it("only takes the project's own webhook auth methods, and lets viewers read but not change", async () => {
    const id = crypto.randomUUID();
    const bad = await refusal(request("PUT", `/api/projects/${a}/channels/${id}`, { name: "x", destination_url: "https://x.example.org", client_auth_method_ids: [crypto.randomUUID()] }));
    expect(bad?.fieldErrors["client_auth_method_ids.0"]).toBeTruthy();
    signInAs("user-beth");
    await expect(list()).resolves.toBeTruthy();
    expect((await refusal(request("PUT", `/api/projects/${a}/channels/${id}`, { name: "x", destination_url: "https://x.example.org" })))?.code).toBe("forbidden");
  });
});
