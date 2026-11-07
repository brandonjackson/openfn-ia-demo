import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import ApiProvider from "../../api/ApiProvider";
import { forgetCsrfToken, request } from "../../api/client";
import { setFlags } from "../../app/feature-flags";
import { findNodeByPath } from "../../app/ia-utils";
import { failNext, resetFakeApi, setWait } from "../../fake-api";
import { allFlagsOn } from "../../model/feature-flags";
import { iaTree } from "../../model/ia-tree";
import SystemPageQuery from "./SystemPage.query";

const wait = { timeout: 3000 };

type Systems = { data: { id: string; attributes: { name: string; connection?: { method: string } } }[] };
type Grants = { data: { id: string; attributes: { granted_to: string } }[] };

/** The seeded system with this name, as the server lists it. */
async function systemNamed(name: string) {
  const { data } = await request<Systems>("GET", "/api/demo/connected_systems");
  return data.find((s) => s.attributes.name === name)!;
}

function renderRoute(id: string) {
  const path = `/connected-systems/${id}`;
  const route = { ...findNodeByPath(iaTree, path)!, currentPath: path };
  render(
    <ApiProvider retry={false}>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/connected-systems" element={<p>Systems list</p>} />
          <Route path="*" element={<SystemPageQuery route={route} />} />
        </Routes>
      </MemoryRouter>
    </ApiProvider>,
  );
}

describe("SystemPageQuery", () => {
  beforeEach(() => {
    setWait(0);
    resetFakeApi();
    forgetCsrfToken();
    setFlags(allFlagsOn);
  });
  afterEach(() => setFlags(allFlagsOn));

  it("shows a system and who has access, as the server has them", async () => {
    const dhis2 = await systemNamed("DHIS2");
    const grants = await request<Grants>("GET", `/api/demo/connected_systems/${dhis2.id}/access_grants`);
    renderRoute(dhis2.id);
    expect(await screen.findByRole("heading", { name: "DHIS2" }, wait)).toBeTruthy();
    expect(screen.getByText(grants.data[0]!.attributes.granted_to)).toBeTruthy();
  });

  it("shows an X-Road system's route from the organisation's identity and the directory", async () => {
    const system = await systemNamed("National ID verification");
    renderRoute(system.id);
    await screen.findByRole("heading", { name: "National ID verification" }, wait);
    // The provider's member and service, named as X-Road names them, from the directory.
    expect((await screen.findAllByText(/FJ\/GOV\/MOI/, {}, wait)).length).toBeGreaterThan(0);
  });

  it("revokes a grant on the server", async () => {
    const dhis2 = await systemNamed("DHIS2");
    renderRoute(dhis2.id);
    const before = await request<Grants>("GET", `/api/demo/connected_systems/${dhis2.id}/access_grants`);
    fireEvent.click((await screen.findAllByRole("button", { name: "Revoke" }, wait))[0]!);
    fireEvent.click(within(screen.getByRole("dialog")).getByRole("button", { name: "Revoke" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull(), wait);
    const after = await request<Grants>("GET", `/api/demo/connected_systems/${dhis2.id}/access_grants`);
    expect(after.data).toHaveLength(before.data.length - 1);
  });

  it("deletes the system on the server and goes back to the list", async () => {
    const dhis2 = await systemNamed("DHIS2");
    renderRoute(dhis2.id);
    fireEvent.click(await screen.findByRole("button", { name: "Delete system" }, wait));
    fireEvent.change(screen.getByLabelText("Type the system's name to confirm"), { target: { value: "DHIS2" } });
    fireEvent.click(within(screen.getByRole("dialog")).getByRole("button", { name: "Delete system" }));
    expect(await screen.findByText("Systems list", {}, wait)).toBeTruthy();
    const { data } = await request<Systems>("GET", "/api/demo/connected_systems");
    expect(data.some((s) => s.id === dhis2.id)).toBe(false);
  });

  it("says a system reached over X-Road isn't there without X-Road", async () => {
    const system = await systemNamed("National ID verification");
    setFlags({ ...allFlagsOn, xroad: false });
    renderRoute(system.id);
    expect(await screen.findByText("Page Not Found", {}, wait)).toBeTruthy();
  });

  it("still shows an X-Road system, without its route, when the directory fails to load", async () => {
    const system = await systemNamed("National ID verification");
    failNext("GET /api/demo/organization/xroad/directory", { status: 500, code: "internal", detail: "The directory is unavailable." });
    renderRoute(system.id);
    expect(await screen.findByRole("heading", { name: "National ID verification" }, wait)).toBeTruthy();
    expect(screen.queryByText(/FJ\/GOV\/MOI/)).toBeNull();
  });

  it("shows the server's message when the system fails to load", async () => {
    failNext("GET /api/demo/connected_systems", { status: 500, code: "internal", detail: "Systems are unavailable." });
    renderRoute("0d6f4a52-1c1e-4b35-9a43-5b0b7c1e2a10");
    expect(await screen.findByText("Systems are unavailable.", {}, wait)).toBeTruthy();
  });
});
