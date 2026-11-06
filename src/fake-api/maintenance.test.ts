import { beforeEach, describe, expect, it } from "vitest";
import { ApiError, forgetCsrfToken, request } from "../api/client";
import { resetFakeApi, setWait } from ".";

type Job = { id: string; last_run_at: string | null; last_run_result: string | null };
const refusal = (promise: Promise<unknown>) => promise.then(() => undefined, (e: unknown) => e as ApiError);

beforeEach(() => {
  setWait(0);
  resetFakeApi();
  forgetCsrfToken();
});

describe("maintenance (the demo's own routes)", () => {
  it("lists the jobs, runs one and records when and what it did, and refuses one it doesn't have", async () => {
    const before = Date.now();
    const { data } = await request<{ data: Job }>("POST", "/api/demo/maintenance/refresh-icons/runs");
    expect(data.last_run_result).toBe("3 updated, 211 unchanged");
    expect(Date.parse(data.last_run_at!)).toBeGreaterThanOrEqual(before - 1000);
    const list = await request<{ data: Job[] }>("GET", "/api/demo/maintenance");
    expect(list.data.find((j) => j.id === "refresh-icons")).toEqual(data);
    expect((await refusal(request("POST", "/api/demo/maintenance/nope/runs")))?.code).toBe("not_found");
  });
});

describe("testing a sign-on provider (the demo's own route)", () => {
  it("says whether a discovery URL looks like an OpenID configuration, and needs one", async () => {
    const good = await request<{ data: { ok: boolean } }>("POST", "/api/demo/auth_provider/test", { discovery_url: "https://id.example.org/.well-known/openid-configuration" });
    expect(good.data.ok).toBe(true);
    const bad = await request<{ data: { ok: boolean } }>("POST", "/api/demo/auth_provider/test", { discovery_url: "http://id.example.org" });
    expect(bad.data.ok).toBe(false);
    expect((await refusal(request("POST", "/api/demo/auth_provider/test", {})))?.code).toBe("invalid");
  });
});
