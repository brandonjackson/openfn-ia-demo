import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { FormError } from "../../model/form-error";
import type { XRoadIdentity } from "../../model/xroad";
import { renderPage } from "../../test/renderPage";
import ServicePage, { type ServicePageData, type ServicePageProps } from "./ServicePage";

const identity: XRoadIdentity = {
  instance: "FJ",
  memberClass: "GOV",
  memberCode: "MOH",
  memberName: "Ministry of Health",
  subsystems: [{ code: "OPENFN", description: "Workflows", openfn: true }],
  certificates: [],
  securityServers: [{ id: "ss1", code: "SS1", address: "ss1.moh.gov.fj", version: "7.4", enabled: true, lastSeen: "Just now" }],
};

const data: ServicePageData = {
  projectId: "7c1f0a4e-2b8d-4f3a-9e6c-1d2b3a4c5d6e",
  projectName: "case-surveillance",
  service: { id: "3e9b6c1a-5d4f-4a2b-8c7e-9f0a1b2c3d4e", name: "Report a suspected case", description: "Takes a case report.", status: "Live", mcpEnabled: false },
  workflow: { id: "wf-1", name: "Case intake" },
  api: {
    trigger: "webhook",
    invocation: "POST https://app.openfn.org/i/case-surveillance/report-case",
    auth: "API key in the x-api-key header",
    outputDescription: "Returns the work order ID.",
    outputExample: "{}",
  },
  xroadOrg: identity,
};

const actions = ["onOpenProject", "onOpenWorkflow", "onEnableMcp", "onPublishToXRoad"] satisfies (keyof ServicePageProps)[];

const frame = (d: ServicePageData = data) => ({
  node: { id: "service", label: d.service.name, pageType: "service" as const },
  ancestors: [],
  currentPath: `/projects/${d.projectId}/services/${d.service.id}`,
  data: d,
});

describe("ServicePage", () => {
  it("shows the service and the three ways to call it on X-Road", () => {
    renderPage(ServicePage, frame(), actions);
    expect(screen.getByRole("heading", { name: "Report a suspected case" })).toBeTruthy();
    expect(screen.getByText("Three ways to call it")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Publish to X-Road" })).toBeTruthy();
  });

  it("offers two ways to call it, and nothing to publish, when the organisation isn't on X-Road", () => {
    renderPage(ServicePage, frame({ ...data, xroadOrg: undefined }), actions);
    expect(screen.getByText("Two ways to call it")).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Publish to X-Road" })).toBeNull();
  });

  it("turns MCP on, waiting while it's turned on and ignoring a second press", async () => {
    const host = renderPage(ServicePage, frame(), actions);
    fireEvent.click(screen.getByRole("button", { name: "Enable MCP" }));
    const busy = screen.getByRole("button", { name: "Enabling…" });
    expect(busy.getAttribute("aria-disabled")).toBe("true");
    fireEvent.click(busy);
    expect(host.calls("onEnableMcp")).toHaveLength(1);
    await host.resolve("onEnableMcp");
    expect(screen.queryByRole("alert")).toBeNull();
  });

  it("says why when the server refuses to turn MCP on", async () => {
    const host = renderPage(ServicePage, frame(), actions);
    fireEvent.click(screen.getByRole("button", { name: "Enable MCP" }));
    await host.reject("onEnableMcp", new FormError("MCP is off for this organisation."));
    expect(screen.getByRole("alert").textContent).toContain("MCP wasn't turned on");
    expect(screen.getByRole("alert").textContent).toContain("MCP is off for this organisation.");
    expect(screen.getByRole("button", { name: "Enable MCP" })).toBeTruthy();
  });

  it("publishes to X-Road from its checklist, waiting while it's published, and says why if the server refuses", async () => {
    const host = renderPage(ServicePage, frame(), actions);
    fireEvent.click(screen.getByRole("button", { name: "Publish to X-Road" }));
    fireEvent.click(screen.getByRole("button", { name: "Mark as published" }));
    expect(host.calls("onPublishToXRoad")).toHaveLength(1);
    const busy = screen.getByRole("button", { name: "Publishing…" });
    expect(busy.getAttribute("aria-disabled")).toBe("true");
    fireEvent.click(busy);
    expect(screen.queryByRole("button", { name: "Mark as published" })).toBeNull();
    await host.reject("onPublishToXRoad", new FormError("is not a service code"));
    expect(screen.getByRole("alert").textContent).toContain("It wasn't published to X-Road");
  });

  it("opens the project and the workflow behind the service", () => {
    const host = renderPage(ServicePage, frame(), actions);
    fireEvent.click(screen.getByRole("button", { name: "View project" }));
    fireEvent.click(screen.getByRole("button", { name: "Open workflow" }));
    expect(host.calls("onOpenProject")).toHaveLength(1);
    expect(host.calls("onOpenWorkflow")).toEqual([["wf-1"]]);
  });

  it("leaves out Enable MCP and Publish to X-Road for someone who can't change the service", () => {
    renderPage(ServicePage, frame(), ["onOpenProject", "onOpenWorkflow"]);
    expect(screen.queryByRole("button", { name: "Enable MCP" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Publish to X-Road" })).toBeNull();
  });
});
