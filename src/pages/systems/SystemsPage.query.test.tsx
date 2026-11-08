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
import SystemsPageQuery from "./SystemsPage.query";

const wait = { timeout: 3000 };

type Systems = { data: { id: string; attributes: { name: string; connection?: { method: string } } }[] };

function renderRoute() {
  const path = "/connected-systems";
  const route = { ...findNodeByPath(iaTree, path)!, currentPath: path };
  render(
    <ApiProvider retry={false}>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/connected-systems" element={<SystemsPageQuery route={route} />} />
          <Route path="/connected-systems/:id" element={<p>A system's page</p>} />
        </Routes>
      </MemoryRouter>
    </ApiProvider>,
  );
}

describe("SystemsPageQuery", () => {
  beforeEach(() => {
    // jsdom has no ResizeObserver, which the ecosystem map watches its frame with.
    globalThis.ResizeObserver ??= class {
      observe() {}
      unobserve() {}
      disconnect() {}
    };
    setWait(0);
    resetFakeApi();
    forgetCsrfToken();
    setFlags(allFlagsOn);
  });
  afterEach(() => setFlags(allFlagsOn));

  it("lists the systems the server has, with the X-Road directory", async () => {
    const { data } = await request<Systems>("GET", "/api/demo/connected_systems?page_size=100");
    renderRoute();
    expect(await screen.findByText(data[0]!.attributes.name, {}, wait)).toBeTruthy();
    expect(screen.getByText("Available via X-Road")).toBeTruthy();
  });

  it("adds a service from the directory on the server, and marks it added", async () => {
    renderRoute();
    const member = await screen.findByRole("region", { name: "Ministry of Interior" }, wait);
    const before = await request<Systems>("GET", "/api/demo/connected_systems?page_size=100");
    fireEvent.click(within(member).getAllByRole("button", { name: "Add" })[0]!);
    await waitFor(async () => {
      const after = await request<Systems>("GET", "/api/demo/connected_systems?page_size=100");
      expect(after.data.length).toBe(before.data.length + 1);
    }, wait);
  });

  it("shows the map from the server, without a system that's been deleted", async () => {
    const { data } = await request<Systems>("GET", "/api/demo/connected_systems?page_size=100");
    const dhis2 = data.find((s) => s.attributes.name === "DHIS2")!;
    await request("DELETE", `/api/demo/connected_systems/${dhis2.id}`);
    renderRoute();
    fireEvent.click(await screen.findByRole("button", { name: "Ecosystem" }, wait));
    expect((await screen.findAllByText("CommCare", {}, wait)).length).toBeGreaterThan(0);
    expect(screen.queryByText("DHIS2")).toBeNull();
  });

  it("leaves out systems reached over X-Road, and the directory, without X-Road", async () => {
    setFlags({ ...allFlagsOn, xroad: false });
    renderRoute();
    await screen.findByText("DHIS2", {}, wait);
    expect(screen.queryByText("National ID verification")).toBeNull();
    expect(screen.queryByText("Available via X-Road")).toBeNull();
  });

  it("shows the server's message when the systems fail to load", async () => {
    failNext("GET /api/demo/connected_systems", { status: 500, code: "internal", detail: "Systems are unavailable." });
    renderRoute();
    expect(await screen.findByText("Systems are unavailable.", {}, wait)).toBeTruthy();
  });
});
