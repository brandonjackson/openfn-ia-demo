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
    await request("POST", "/api/session", { password: "my current password" });
    await request("PATCH", `/api/users/${currentUserId()}`, { email: "janet@example.org" });
    const me = await request<Me>("GET", "/api/me");
    expect(me.data.attributes).toMatchObject({ first_name: "Janet", contact_preference: "any", email: "jane.doe@example.org", pending_email: "janet@example.org" });
    expect((await refusal(request("PATCH", `/api/users/${currentUserId()}`, { email: "pnair@example.org" })))?.fieldErrors["email"]).toEqual(["has already been taken"]);
  });

  it("records a change to your name with you as the actor, and refuses a contact preference it doesn't know", async () => {
    await request("PATCH", `/api/users/${currentUserId()}`, { first_name: "Janet" });
    const events = await request<{ data: { attributes: Record<string, unknown> }[] }>("GET", "/api/audit_events");
    expect(events.data[0]!.attributes).toMatchObject({ event: "updated", item_type: "user", item_id: currentUserId(), changes: { after: { first_name: "Janet" } } });
    expect((await refusal(request("PATCH", `/api/users/${currentUserId()}`, { contact_preference: "often" })))?.fieldErrors["contact_preference"]).toEqual(["is invalid"]);
  });

  it("asks a session that hasn't stepped up to before changing your email or password, and refuses an empty password to step up", async () => {
    for (const body of [{ email: "janet@example.org" }, { password: "a new password!" }]) {
      expect((await refusal(request("PATCH", `/api/users/${currentUserId()}`, body)))?.code).toBe("step_up_required");
    }
    expect((await refusal(request("POST", "/api/session", { password: "" })))?.code).toBe("invalid_credentials");
    const session = await request<{ data: { stepped_up_until: string | null } }>("GET", "/api/session");
    expect(session.data.stepped_up_until).toBeNull();
  });

  it("revokes your personal access tokens when you set a new password", async () => {
    await request("POST", "/api/me/tokens");
    await request("POST", "/api/session", { password: "my current password" });
    expect((await refusal(request("PATCH", `/api/users/${currentUserId()}`, { password: "short" })))?.fieldErrors["password"]).toEqual(["should be at least 12 character(s)"]);
    await request("PATCH", `/api/users/${currentUserId()}`, { password: "a new password!" });
    expect((await request<{ data: unknown[] }>("GET", "/api/me/tokens")).data).toEqual([]);
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
