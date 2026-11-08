import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import ApiProvider from "../../api/ApiProvider";
import { forgetCsrfToken, request } from "../../api/client";
import { setFlags } from "../../app/feature-flags";
import { findNodeByPath } from "../../app/ia-utils";
import { failNext, resetFakeApi, setWait } from "../../fake-api";
import { allFlagsOn } from "../../model/feature-flags";
import { iaTree } from "../../model/ia-tree";
import ServicesPageQuery from "./ServicesPage.query";

const wait = { timeout: 3000 };

type Services = { data: { id: string; attributes: { name: string; status: string; project_id: string } }[] };
type Systems = { data: { id: string; attributes: { name: string } }[] };

function renderRoute() {
  const path = "/service-catalog";
  const route = { ...findNodeByPath(iaTree, path)!, currentPath: path };
  render(
    <ApiProvider retry={false}>
      <MemoryRouter initialEntries={[path]}>
        <ServicesPageQuery route={route} />
      </MemoryRouter>
    </ApiProvider>,
  );
}

describe("ServicesPageQuery", () => {
  beforeEach(() => {
    setWait(0);
    resetFakeApi();
    forgetCsrfToken();
    setFlags(allFlagsOn);
  });
  afterEach(() => setFlags(allFlagsOn));

  it("lists every Live service the server has, and no Draft one", async () => {
    const { data } = await request<Services>("GET", "/api/demo/services?page_size=100");
    const live = data.filter((s) => s.attributes.status === "Live");
    const draft = data.find((s) => s.attributes.status === "Draft")!;
    renderRoute();
    expect(await screen.findByText(live[0]!.attributes.name, {}, wait)).toBeTruthy();
    for (const s of live) expect(screen.getByText(s.attributes.name)).toBeTruthy();
    expect(screen.queryByText(draft.attributes.name)).toBeNull();
  });

  it("names the MCP server from the organisation", async () => {
    renderRoute();
    expect(await screen.findByText("https://app.openfn.org/mcp/ministry-of-health", {}, wait)).toBeTruthy();
  });

  it("lists what the organisation's systems offer, and the services it uses over X-Road", async () => {
    renderRoute();
    fireEvent.click(await screen.findByRole("button", { name: /Services we use/ }, wait));
    expect(await screen.findByText("Birth registered", {}, wait)).toBeTruthy();
    // The services we use over X-Road come from the systems and the directory.
    expect(await screen.findByText("Verify a national ID", {}, wait)).toBeTruthy();
  });

  it("drops a deleted system's channels", async () => {
    const systems = await request<Systems>("GET", "/api/demo/connected_systems?page_size=100");
    const opencrvs = systems.data.find((s) => s.attributes.name === "OpenCRVS")!;
    await request("DELETE", `/api/demo/connected_systems/${opencrvs.id}`);
    renderRoute();
    fireEvent.click(await screen.findByRole("button", { name: /Services we use/ }, wait));
    await screen.findByText("Verify a national ID", {}, wait);
    expect(screen.queryByText("Birth registered")).toBeNull();
  });

  it("takes a service turned to Draft out of the catalog", async () => {
    const { data } = await request<Services>("GET", "/api/demo/services?page_size=100");
    // A Live service in a project you can change.
    let live: Services["data"][number] | undefined;
    for (const s of data.filter((s) => s.attributes.status === "Live")) {
      const project = await request<{ data: { attributes: { permissions?: { edit_project?: boolean } } } }>("GET", `/api/projects/${s.attributes.project_id}`);
      if (project.data.attributes.permissions?.edit_project) live = s;
    }
    if (!live) throw new Error("No Live service in a project you can change");
    await request("PATCH", `/api/demo/projects/${live.attributes.project_id}/services/${live.id}`, { status: "Draft" });
    renderRoute();
    await screen.findByRole("button", { name: /Services we publish/ }, wait);
    await waitFor(() => expect(screen.queryByText(live.attributes.name)).toBeNull(), wait);
  });

  it("shows the server's message when the services fail to load", async () => {
    failNext("GET /api/demo/services", { status: 500, code: "internal", detail: "Services are unavailable." });
    renderRoute();
    expect(await screen.findByText("Services are unavailable.", {}, wait)).toBeTruthy();
  });
});
