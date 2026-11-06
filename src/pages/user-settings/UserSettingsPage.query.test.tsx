import { fireEvent, render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it } from "vitest";
import ApiProvider from "../../api/ApiProvider";
import { forgetCsrfToken, request } from "../../api/client";
import { findNodeByPath } from "../../app/ia-utils";
import { failNext, resetFakeApi, setWait } from "../../fake-api";
import { iaTree } from "../../model/ia-tree";
import UserSettingsPageQuery from "./UserSettingsPage.query";

const wait = { timeout: 3000 };

function renderRoute(path = "/user-settings/credentials") {
  const route = { ...findNodeByPath(iaTree, path)!, currentPath: path };
  render(
    <ApiProvider retry={false}>
      <MemoryRouter initialEntries={[path]}>
        <UserSettingsPageQuery route={route} />
      </MemoryRouter>
    </ApiProvider>,
  );
}


describe("UserSettingsPageQuery", () => {
  beforeEach(() => {
    setWait(0);
    resetFakeApi();
    forgetCsrfToken();
  });

  it("lists the credentials the server has for you", async () => {
    const { credentials } = await request<{ credentials: { name: string }[] }>("GET", "/api/credentials");
    renderRoute();
    expect(await screen.findByText(credentials[0]!.name, {}, wait)).toBeTruthy();
  });

  it("offers the server's credential schemas, with the fields each one asks for", async () => {
    renderRoute();
    fireEvent.click((await screen.findAllByRole("button", { name: "New credential" }, wait))[0]!);
    const picker = within(screen.getByRole("dialog"));
    expect(picker.getByText("Raw JSON")).toBeTruthy();
    fireEvent.click(picker.getByText("DHIS2"));
    fireEvent.click(screen.getByRole("button", { name: "Configure credential" }));
    expect(screen.getByLabelText(/^Host URL/)).toBeTruthy();
    expect(screen.getByLabelText(/^Password/)).toBeTruthy();
  });

  it("makes a token on the server and shows it once", async () => {
    renderRoute("/user-settings/api-tokens");
    fireEvent.click((await screen.findAllByRole("button", { name: "Generate new token" }, wait))[0]!);
    expect(await screen.findByText("Copy your token now. You won't be able to see it again.", {}, wait)).toBeTruthy();
    const { data } = await request<{ data: unknown[] }>("GET", "/api/me/tokens");
    expect(data.length).toBeGreaterThan(0);
  });

  it("shows the server's message when the credential schemas fail to load", async () => {
    failNext("GET /api/credential_schemas", { status: 503, code: "not_ready", detail: "Lightning is still loading the adaptors." });
    renderRoute();
    expect(await screen.findByText("Lightning is still loading the adaptors.", {}, wait)).toBeTruthy();
  });
});
