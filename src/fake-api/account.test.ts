import { beforeEach, describe, expect, it } from "vitest";
import { forgetCsrfToken, request, type ApiError } from "../api/client";
import { resetFakeApi, setWait } from ".";
import { currentUserId } from "./session";

const refusal = (p: Promise<unknown>) => p.then(() => undefined, (e: unknown) => e as ApiError);
type Me = { data: { attributes: Record<string, unknown> } };

beforeEach(() => {
  setWait(0);
  resetFakeApi();
  forgetCsrfToken();
});

describe("your account", () => {
  it("changes your name, and holds a new email until it's confirmed", async () => {
    await request("PATCH", `/api/users/${currentUserId()}`, { first_name: "Janet", contact_preference: "any" });
    await request("PATCH", `/api/users/${currentUserId()}`, { email: "janet@example.org" });
    const me = await request<Me>("GET", "/api/me");
    expect(me.data.attributes).toMatchObject({ first_name: "Janet", contact_preference: "any", email: "jane.doe@example.org", pending_email: "janet@example.org" });
    expect((await refusal(request("PATCH", `/api/users/${currentUserId()}`, { email: "pnair@example.org" })))?.fieldErrors["email"]).toEqual(["has already been taken"]);
  });

  it("shows a new token once, and only its end after", async () => {
    const { data } = await request<{ data: { id: string; token: string } }>("POST", "/api/me/tokens");
    const list = await request<{ data: { id: string; token: string }[] }>("GET", "/api/me/tokens");
    expect(list.data[0]).toMatchObject({ id: data.id, token: `...${data.token.slice(-10)}` });
    await request("DELETE", `/api/me/tokens/${data.id}`);
    expect((await refusal(request("DELETE", `/api/me/tokens/${data.id}`)))?.code).toBe("not_found");
  });

  it("turns MFA on with a code from the new secret, with ten backup codes, and off again", async () => {
    const { data } = await request<{ data: { secret: string } }>("POST", "/api/me/mfa");
    expect((await refusal(request("PUT", "/api/me/mfa", { secret: data.secret, code: "12ab" })))?.fieldErrors["code"]).toBeTruthy();
    const on = await request<{ data: { enabled: boolean; backup_codes: unknown[] } }>("PUT", "/api/me/mfa", { secret: data.secret, code: "123456" });
    expect(on.data.enabled).toBe(true);
    expect(on.data.backup_codes).toHaveLength(10);
    await request("DELETE", "/api/me/mfa");
    expect((await request<{ data: { enabled: boolean; backup_codes: null } }>("GET", "/api/me/mfa")).data).toEqual({ enabled: false, backup_codes: null });
  });

  it("won't schedule a superuser's own account for deletion", async () => {
    expect((await refusal(request("DELETE", `/api/users/${currentUserId()}`)))?.code).toBe("invalid");
  });

  it("checks a single sign-on provider's discovery URL before saving it", async () => {
    const bad = await refusal(request("PUT", "/api/auth_provider", { name: "sso", discovery_url: "http://login.example.org", client_id: "x", client_secret: "y" }));
    expect(bad?.errors[0]?.code).toBe("discovery_failed");
    await request("DELETE", "/api/auth_provider");
    expect((await refusal(request("GET", "/api/auth_provider")))?.code).toBe("not_found");
  });
});
