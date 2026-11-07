import { render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import ApiProvider from "../api/ApiProvider";
import SignedIn from "./SignedIn";
import { signInUrl } from "./sign-in";

// On Lightning: requests go to `fetch`, stubbed per test with Lightning's answer to GET /api/session.
vi.mock("../api/source", () => ({ apiSource: "lightning", send: (path: string, init?: RequestInit) => fetch(path, init) }));

const answer = (status: number, body: unknown) => () => Promise.resolve(new Response(JSON.stringify(body), { status }));
const assign = vi.fn();

beforeEach(() => {
  assign.mockReset();
  vi.stubGlobal("location", { ...window.location, hash: "#/projects/abc", assign });
});

afterEach(() => {
  vi.unstubAllGlobals();
});

const draw = () =>
  render(
    <ApiProvider retry={false}>
      <SignedIn>
        <p>The app</p>
      </SignedIn>
    </ApiProvider>,
  );

describe("signing in on Lightning", () => {
  it("shows the app once Lightning says someone is signed in", async () => {
    vi.stubGlobal("fetch", answer(200, { data: { state: "signed_in", csrf_token: "t" } }));
    draw();
    expect(await screen.findByText("The app")).toBeTruthy();
    expect(assign).not.toHaveBeenCalled();
  });

  it("sends the browser to sign in, to come back to this screen, when no one is", async () => {
    vi.stubGlobal("fetch", answer(401, { code: "unauthenticated", detail: "Sign in first." }));
    draw();
    await waitFor(() => expect(assign).toHaveBeenCalledWith(signInUrl("#/projects/abc")));
    expect(screen.queryByText("The app")).toBeNull();
  });

  it("sends the browser to Lightning's pages to finish a sign-in that's waiting on an MFA code", async () => {
    vi.stubGlobal("fetch", answer(200, { data: { state: "mfa_required", csrf_token: "t" } }));
    draw();
    await waitFor(() => expect(assign).toHaveBeenCalledWith(signInUrl("#/projects/abc")));
    expect(screen.queryByText("The app")).toBeNull();
  });

  it("lets the pages show the error when Lightning can't say", async () => {
    vi.stubGlobal("fetch", answer(500, { code: "internal", detail: "Something broke." }));
    draw();
    expect(await screen.findByText("The app")).toBeTruthy();
    expect(assign).not.toHaveBeenCalled();
  });
});

describe("the sign-in address", () => {
  it("names the screen to come back to", () => {
    expect(signInUrl("#/projects/abc")).toBe("/sign_in?to=%23%2Fprojects%2Fabc");
    expect(signInUrl("")).toBe("/sign_in");
  });
});
