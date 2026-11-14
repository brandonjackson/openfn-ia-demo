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
  service: { id: "3e9b6c1a-5d4f-4a2b-8c7e-9f0a1b2c3d4e", name: "Report a suspected case", description: "Takes a case report.", mcpEnabled: false },
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

const actions = ["onOpenWorkflow", "onEditListing", "onEnableMcp", "onPublishToXRoad"] satisfies (keyof ServicePageProps)[];

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

  it("offers Enable MCP again when the server refuses (the wrapper says why)", async () => {
    const host = renderPage(ServicePage, frame(), actions);
    fireEvent.click(screen.getByRole("button", { name: "Enable MCP" }));
    await host.reject("onEnableMcp", new FormError("MCP is off for this organisation."));
    expect(screen.getByRole("button", { name: "Enable MCP" })).toBeTruthy();
  });

  it("publishes to X-Road from its checklist, waiting while it's published", async () => {
    const host = renderPage(ServicePage, frame(), actions);
    fireEvent.click(screen.getByRole("button", { name: "Publish to X-Road" }));
    fireEvent.click(screen.getByRole("button", { name: "Mark as published" }));
    expect(host.calls("onPublishToXRoad")).toHaveLength(1);
    const busy = screen.getByRole("button", { name: "Publishing…" });
    expect(busy.getAttribute("aria-disabled")).toBe("true");
    fireEvent.click(busy);
    expect(screen.queryByRole("button", { name: "Mark as published" })).toBeNull();
    await host.reject("onPublishToXRoad", new FormError("is not a service code"));
    expect(screen.queryByRole("button", { name: "Publishing…" })).toBeNull();
  });

  it("opens the workflow behind the service, and has no View project", () => {
    const host = renderPage(ServicePage, frame(), actions);
    fireEvent.click(screen.getByRole("button", { name: "Open workflow" }));
    expect(host.calls("onOpenWorkflow")).toEqual([["wf-1"]]);
    expect(screen.queryByRole("button", { name: "View project" })).toBeNull();
    expect(screen.queryByText("Draft")).toBeNull();
  });

  it("edits the listing, saying so while it saves, and closes once saved", async () => {
    const host = renderPage(ServicePage, frame(), actions);
    fireEvent.click(screen.getByRole("button", { name: "Edit listing" }));
    const name = screen.getByLabelText(/^Name/);
    expect((name as HTMLInputElement).value).toBe("Report a suspected case");
    fireEvent.change(name, { target: { value: "Report a case" } });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    const busy = screen.getByRole("button", { name: "Saving…" });
    expect(busy.getAttribute("aria-disabled")).toBe("true");
    fireEvent.click(busy);
    expect(host.calls("onEditListing")).toEqual([[{ name: "Report a case", description: "Takes a case report." }]]);
    await host.resolve("onEditListing");
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("says a name is needed, under the field, and keeps the listing open when the server refuses", async () => {
    const host = renderPage(ServicePage, frame(), actions);
    fireEvent.click(screen.getByRole("button", { name: "Edit listing" }));
    fireEvent.change(screen.getByLabelText(/^Name/), { target: { value: " " } });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    expect(screen.getByText("Enter a name for the service")).toBeTruthy();
    expect(document.activeElement).toBe(screen.getByLabelText(/^Name/));
    expect(host.calls("onEditListing")).toHaveLength(0);

    fireEvent.change(screen.getByLabelText(/^Name/), { target: { value: "Report a case" } });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    await host.reject("onEditListing", new FormError("The listing could not be saved.", { name: ["is too long"] }));
    expect(screen.getByText("is too long")).toBeTruthy();
    expect(screen.getByRole("dialog")).toBeTruthy();
  });

  it("leaves out Edit listing, Enable MCP and Publish to X-Road for someone who can't change the service", () => {
    renderPage(ServicePage, frame(), ["onOpenWorkflow"]);
    expect(screen.queryByRole("button", { name: "Edit listing" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Enable MCP" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Publish to X-Road" })).toBeNull();
  });
});
