import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { AnnouncementsProvider } from "../../app/announcements";
import ApiProvider from "../../api/ApiProvider";
import { forgetCsrfToken, request } from "../../api/client";
import { setFlags } from "../../app/feature-flags";
import { findNodeByPath } from "../../app/ia-utils";
import { failNext, resetFakeApi, setWait } from "../../fake-api";
import { allFlagsOn } from "../../model/feature-flags";
import { iaTree } from "../../model/ia-tree";
import ServicePageQuery from "./ServicePage.query";

const wait = { timeout: 3000 };

type Service = { id: string; attributes: { name: string; project_id: string; mcpEnabled?: boolean } };

type Project = { data: { attributes: { permissions?: { edit_project?: boolean } } } };

/** A seeded service with MCP off, in a project you can change, as the server lists it. */
async function serviceWithoutMcp() {
  const { data } = await request<{ data: Service[] }>("GET", "/api/demo/services");
  for (const s of data.filter((s) => !s.attributes.mcpEnabled)) {
    const project = await request<Project>("GET", `/api/projects/${s.attributes.project_id}`);
    if (project.data.attributes.permissions?.edit_project) return s;
  }
  throw new Error("No service with MCP off in a project you can change");
}

function renderRoute(service: Service) {
  const path = `/projects/${service.attributes.project_id}/services/${service.id}`;
  const route = { ...findNodeByPath(iaTree, path)!, currentPath: path };
  render(
    <ApiProvider retry={false}>
      <AnnouncementsProvider>
        <MemoryRouter initialEntries={[path]}>
          <ServicePageQuery route={route} />
        </MemoryRouter>
      </AnnouncementsProvider>
    </ApiProvider>,
  );
}

describe("ServicePageQuery", () => {
  beforeEach(() => {
    setWait(0);
    resetFakeApi();
    forgetCsrfToken();
    setFlags(allFlagsOn);
  });
  afterEach(() => setFlags(allFlagsOn));

  it("shows the service as the server has it, on X-Road with the organisation's identity", async () => {
    const service = await serviceWithoutMcp();
    renderRoute(service);
    expect(await screen.findByRole("heading", { name: service.attributes.name }, wait)).toBeTruthy();
    expect(await screen.findByText("Three ways to call it", {}, wait)).toBeTruthy();
  });

  it("turns MCP on, on the server", async () => {
    const service = await serviceWithoutMcp();
    renderRoute(service);
    fireEvent.click(await screen.findByRole("button", { name: "Enable MCP" }, wait));
    await waitFor(() => expect(screen.queryByRole("button", { name: /Enable MCP|Enabling…/ })).toBeNull(), wait);
    const { data } = await request<{ data: Service }>("GET", `/api/demo/projects/${service.attributes.project_id}/services/${service.id}`);
    expect(data.attributes.mcpEnabled).toBe(true);
  });

  it("says why when the server refuses to turn MCP on", async () => {
    const service = await serviceWithoutMcp();
    renderRoute(service);
    const button = await screen.findByRole("button", { name: "Enable MCP" }, wait);
    failNext("PATCH /api/demo/projects/:project_id/services/:id", {
      status: 422,
      code: "invalid",
      detail: "MCP is off for this organisation.",
    });
    fireEvent.click(button);
    await waitFor(() => expect(screen.getByRole("alert").textContent).toContain("MCP wasn't turned on"), wait);
    expect(screen.getByRole("alert").textContent).toContain("MCP is off for this organisation.");
  });

  it("edits the listing on the server, and says so", async () => {
    const service = await serviceWithoutMcp();
    renderRoute(service);
    fireEvent.click(await screen.findByRole("button", { name: "Edit listing" }, wait));
    fireEvent.change(screen.getByLabelText(/^Name/), { target: { value: "Check a referral" } });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    expect(await screen.findByText("Saved the listing.", {}, wait)).toBeTruthy();
    expect(await screen.findByRole("heading", { name: "Check a referral" }, wait)).toBeTruthy();
    const { data } = await request<{ data: Service }>("GET", `/api/demo/projects/${service.attributes.project_id}/services/${service.id}`);
    expect(data.attributes.name).toBe("Check a referral");
  });

  it("shows the server's refusal under the field it names, and keeps the listing open", async () => {
    const service = await serviceWithoutMcp();
    renderRoute(service);
    fireEvent.click(await screen.findByRole("button", { name: "Edit listing" }, wait));
    failNext("PATCH /api/demo/projects/:project_id/services/:id", {
      status: 422,
      code: "invalid",
      detail: "The request body is not valid.",
      errors: [{ code: "length", detail: "should be at most 120 characters", pointer: "#/name" }],
    });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    expect(await screen.findByText("should be at most 120 characters", {}, wait)).toBeTruthy();
    expect(screen.getByRole("dialog")).toBeTruthy();
  });

  it("shows the service off X-Road without the X-Road flag", async () => {
    const service = await serviceWithoutMcp();
    setFlags({ ...allFlagsOn, xroad: false });
    renderRoute(service);
    expect(await screen.findByText("Two ways to call it", {}, wait)).toBeTruthy();
  });

  it("shows the server's message when the organisation's X-Road identity fails to load", async () => {
    const service = await serviceWithoutMcp();
    failNext("GET /api/demo/organization/xroad", { status: 500, code: "internal", detail: "X-Road is unavailable." });
    renderRoute(service);
    expect(await screen.findByText("X-Road is unavailable.", {}, wait)).toBeTruthy();
  });

  it("shows the server's message when the service fails to load", async () => {
    const service = await serviceWithoutMcp();
    failNext("GET /api/demo/services", { status: 500, code: "internal", detail: "Services are unavailable." });
    renderRoute(service);
    expect(await screen.findByText("Services are unavailable.", {}, wait)).toBeTruthy();
  });
});
