import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it } from "vitest";
import ApiProvider from "../api/ApiProvider";
import { forgetCsrfToken } from "../api/client";
import { useShell } from "../components/domain/shell-context";
import { failNext, resetFakeApi, setWait, signInAs } from "../fake-api";
import PageRoute from "./PageRoute";
import ShellQuery from "./Shell.query";

const wait = { timeout: 3000 };

/** What the chrome is given, written out. */
function Chrome() {
  const { instance, user, isSuperuser } = useShell();
  return (
    <ul>
      <li>instance: {instance ? `${instance.name} (${instance.initials})` : "none"}</li>
      <li>user: {user ? `${user.firstName} ${user.lastName}` : "none"}</li>
      <li>superuser: {isSuperuser === undefined ? "unknown" : String(isSuperuser)}</li>
    </ul>
  );
}

function draw(path = "/projects", page = <Chrome />) {
  render(
    <ApiProvider retry={false}>
      <MemoryRouter initialEntries={[path]}>
        <ShellQuery>
          <Routes>
            <Route path="*" element={page} />
          </Routes>
        </ShellQuery>
      </MemoryRouter>
    </ApiProvider>,
  );
}

describe("ShellQuery", () => {
  beforeEach(() => {
    setWait(0);
    resetFakeApi();
    forgetCsrfToken();
  });

  it("gives the chrome the instance and you from the API, leaving them out until they've loaded", async () => {
    draw();
    expect(screen.getByText("instance: none")).toBeTruthy();
    expect(screen.getByText("user: none")).toBeTruthy();
    expect(screen.getByText("superuser: unknown")).toBeTruthy();
    expect(await screen.findByText("instance: Sim DTU (SD)", {}, wait)).toBeTruthy();
    expect(await screen.findByText("user: Jane Doe", {}, wait)).toBeTruthy();
    expect(screen.getByText("superuser: true")).toBeTruthy();
  });

  it("says you're not a superuser when the API says so", async () => {
    signInAs("user-john");
    draw();
    expect(await screen.findByText("superuser: false", {}, wait)).toBeTruthy();
  });

  it("leaves you out, and not a superuser, when you can't be loaded", async () => {
    failNext("GET /api/me", { status: 500, code: "internal", detail: "Something broke." });
    draw();
    expect(await screen.findByText("superuser: false", {}, wait)).toBeTruthy();
    expect(screen.getByText("user: none")).toBeTruthy();
  });

  it("opens Admin settings for a superuser once the API has said so, not Not Found first", async () => {
    draw("/admin-settings", <PageRoute />);
    expect(screen.queryByText("Page Not Found")).toBeNull();
    expect(await screen.findByRole("link", { name: "Users" }, wait)).toBeTruthy();
  });

  it("says Not Found at Admin settings to someone who isn't a superuser", async () => {
    signInAs("user-john");
    draw("/admin-settings", <PageRoute />);
    expect(await screen.findByText("Page Not Found", {}, wait)).toBeTruthy();
  });
});
