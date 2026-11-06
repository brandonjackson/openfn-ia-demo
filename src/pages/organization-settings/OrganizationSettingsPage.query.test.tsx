import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import ApiProvider from "../../api/ApiProvider";
import { forgetCsrfToken, request } from "../../api/client";
import { setFlags } from "../../app/feature-flags";
import { findNodeByPath } from "../../app/ia-utils";
import { failNext, resetFakeApi, setWait } from "../../fake-api";
import { allFlagsOn } from "../../model/feature-flags";
import { iaTree } from "../../model/ia-tree";
import OrganizationSettingsPageQuery from "./OrganizationSettingsPage.query";

const wait = { timeout: 3000 };

function renderRoute(path = "/organization-settings/members") {
  const route = { ...findNodeByPath(iaTree, path)!, currentPath: path };
  render(
    <ApiProvider retry={false}>
      <MemoryRouter initialEntries={[path]}>
        <OrganizationSettingsPageQuery route={route} />
      </MemoryRouter>
    </ApiProvider>,
  );
}

type Member = { attributes: { email: string; name: string } };
type Identity = { data: { attributes: { member_code: string; member_name: string } } };

describe("OrganizationSettingsPageQuery", () => {
  beforeEach(() => {
    setWait(0);
    resetFakeApi();
    forgetCsrfToken();
    setFlags(allFlagsOn);
  });
  afterEach(() => {
    localStorage.removeItem("openfn-ia-demo:feature-flags");
    setFlags(allFlagsOn);
  });

  it("lists the members the server has", async () => {
    const { data } = await request<{ data: Member[] }>("GET", "/api/demo/organization/members");
    renderRoute();
    expect(await screen.findByText(data[0]!.attributes.name, {}, wait)).toBeTruthy();
  });

  it("invites someone on the server, and the list reloads with them", async () => {
    renderRoute();
    fireEvent.click(await screen.findByRole("button", { name: "Invite member" }, wait));
    fireEvent.change(screen.getByLabelText(/^Email/), { target: { value: "new.person@example.org" } });
    fireEvent.click(screen.getByRole("button", { name: "Send invitation" }));
    expect((await screen.findAllByText("new.person@example.org", {}, wait)).length).toBeGreaterThan(0);
    const { data } = await request<{ data: Member[] }>("GET", "/api/demo/organization/members");
    expect(data.some((m) => m.attributes.email === "new.person@example.org")).toBe(true);
  });

  it("shows the X-Road identity the server sends", async () => {
    const { data } = await request<Identity>("GET", "/api/demo/organization/xroad");
    renderRoute("/organization-settings/xroad");
    expect(await screen.findByText(data.attributes.member_code, {}, wait)).toBeTruthy();
  });

  it("asks nothing of X-Road, and leaves its section out, with X-Road off", async () => {
    setFlags({ ...allFlagsOn, xroad: false });
    failNext("GET /api/demo/organization/xroad", { status: 500, code: "internal", detail: "X-Road was asked for." });
    renderRoute("/organization-settings/xroad");
    await screen.findAllByText(/Ministry of Health/, {}, wait);
    expect(screen.queryByText("X-Road was asked for.")).toBeNull();
    expect(screen.queryByRole("link", { name: "X-Road" })).toBeNull();
  });

  it("shows the server's message when the X-Road identity fails to load", async () => {
    failNext("GET /api/demo/organization/xroad", { status: 500, code: "internal", detail: "The X-Road identity is unavailable." });
    renderRoute("/organization-settings/xroad");
    expect(await screen.findByText("The X-Road identity is unavailable.", {}, wait)).toBeTruthy();
  });
});
