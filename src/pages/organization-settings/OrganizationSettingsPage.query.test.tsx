import { fireEvent, render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import ApiProvider from "../../api/ApiProvider";
import { forgetCsrfToken, request } from "../../api/client";
import { setFlags } from "../../app/feature-flags";
import { findNodeByPath } from "../../app/ia-utils";
import { failNext, resetFakeApi, setWait, signInAs } from "../../fake-api";
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

type Member = { attributes: { email: string; first_name: string; last_name: string } };
type Organization = { id: string };
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

  const members = async () => {
    const { data: orgs } = await request<{ data: Organization[] }>("GET", "/api/organizations");
    return (await request<{ data: Member[] }>("GET", `/api/organizations/${orgs[0]!.id}/members`)).data;
  };

  it("renames the organisation on the server, and the page reloads with the new name", async () => {
    renderRoute("/organization-settings/general");
    const field = (await screen.findByLabelText(/^Organization name/, {}, wait)) as HTMLInputElement;
    fireEvent.change(field, { target: { value: "Ministry of Health and Wellness" } });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    expect(await screen.findByText("Your organisation is now called Ministry of Health and Wellness.", {}, wait)).toBeTruthy();
    const { data: orgs } = await request<{ data: { attributes: { name: string } }[] }>("GET", "/api/organizations");
    expect(orgs.some((o) => o.attributes.name === "Ministry of Health and Wellness")).toBe(true);
  });

  it("says under the name why the server refused it", async () => {
    renderRoute("/organization-settings/general");
    const field = await screen.findByLabelText(/^Organization name/, {}, wait);
    fireEvent.change(field, { target: { value: "x".repeat(161) } });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    expect(await screen.findByText(/160/, {}, wait)).toBeTruthy();
  });

  it("lists the members the server has", async () => {
    const [first] = await members();
    renderRoute();
    expect(await screen.findByText(`${first!.attributes.first_name} ${first!.attributes.last_name}`, {}, wait)).toBeTruthy();
  });

  it("adds someone on the server, and the list reloads with them", async () => {
    renderRoute();
    fireEvent.click(await screen.findByRole("button", { name: "Add member" }, wait));
    fireEvent.change(screen.getByLabelText(/^Email/), { target: { value: "pnair@example.org" } });
    fireEvent.click(within(screen.getByRole("dialog")).getByRole("button", { name: "Add member" }));
    expect((await screen.findAllByText("pnair@example.org", {}, wait)).length).toBeGreaterThan(0);
    expect((await members()).some((m) => m.attributes.email === "pnair@example.org")).toBe(true);
  });

  it("says under the email when nobody on the server has it", async () => {
    renderRoute();
    fireEvent.click(await screen.findByRole("button", { name: "Add member" }, wait));
    fireEvent.change(screen.getByLabelText(/^Email/), { target: { value: "nobody@example.org" } });
    fireEvent.click(within(screen.getByRole("dialog")).getByRole("button", { name: "Add member" }));
    expect(await screen.findByText(/names nothing you can see/, {}, wait)).toBeTruthy();
  });

  it("reads only, with no add button, for a member who isn't an admin", async () => {
    signInAs("user-beth");
    renderRoute();
    await screen.findByText("Beth Wilson", {}, wait);
    expect(screen.queryByRole("button", { name: "Add member" })).toBeNull();
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
