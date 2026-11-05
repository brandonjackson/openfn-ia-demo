import { beforeEach, describe, expect, it } from "vitest";
import { request, isApiError, forgetCsrfToken } from "../api/client";
import { fakeFetch, failNext, resetFakeApi, setWait } from ".";

beforeEach(() => {
  setWait(0);
  resetFakeApi();
  forgetCsrfToken();
});

describe("the fake server", () => {
  it("answers an unknown route with a 404 problem document", async () => {
    const answer = await fakeFetch("/api/nowhere");
    expect(answer.status).toBe(404);
    expect(await answer.json()).toMatchObject({ type: "about:blank", status: 404, code: "not_found" });
  });

  it("refuses a write without the session's CSRF token", async () => {
    const answer = await fakeFetch("/api/demo/reset", { method: "POST" });
    expect(answer.status).toBe(403);
  });

  it("lets the client write, since it sends the token", async () => {
    await expect(request("POST", "/api/demo/reset")).resolves.toBeUndefined();
  });

  it("refuses a body that isn't a JSON object", async () => {
    const answer = await fakeFetch("/api/demo/reset", { method: "POST", body: "[1]", headers: { "x-csrf-token": "demo-csrf-token" } });
    expect(answer.status).toBe(400);
    expect(await answer.json()).toMatchObject({ code: "malformed" });
  });

  it("fails the next request to a route on demand", async () => {
    failNext("GET /api/session", { status: 503, code: "service_unavailable" });
    const error = await request("GET", "/api/session").catch((e: unknown) => e);
    expect(isApiError(error, "service_unavailable")).toBe(true);
    await expect(request("GET", "/api/session")).resolves.toBeTruthy();
  });
});
