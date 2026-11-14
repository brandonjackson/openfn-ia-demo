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
import { apiWorkflowId } from "../../fixtures/ids";
import { projectIdFor } from "../../fake-api/projects";
import ServicesPageQuery from "./ServicesPage.query";

const wait = { timeout: 3000 };

type Services = { data: { id: string; attributes: { name: string; project_id: string } }[] };
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

  it("lists every service the server has: a service with a listing is published", async () => {
    const { data } = await request<Services>("GET", "/api/demo/services?page_size=100");
    renderRoute();
    expect(await screen.findByText(data[0]!.attributes.name, {}, wait)).toBeTruthy();
    for (const s of data) expect(screen.getAllByText(s.attributes.name).length).toBeGreaterThan(0);
    expect(screen.queryByText("Draft")).toBeNull();
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

  it("lists a workflow as soon as it's published", async () => {
    await request("POST", `/api/demo/projects/${projectIdFor("project-a")}/services`, { workflow_id: apiWorkflowId("apply-national-id"), name: "Count the beds", description: "" });
    renderRoute();
    expect(await screen.findByText("Count the beds", {}, wait)).toBeTruthy();
  });

  it("shows the server's message when the services fail to load", async () => {
    failNext("GET /api/demo/services", { status: 500, code: "internal", detail: "Services are unavailable." });
    renderRoute();
    expect(await screen.findByText("Services are unavailable.", {}, wait)).toBeTruthy();
  });
});
