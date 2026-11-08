import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { renderPage } from "../../test/renderPage";
import ServicesPage, { type ServicesPageData, type ServicesPageProps } from "./ServicesPage";

const data: ServicesPageData = {
  entries: [
    {
      kind: "workflow",
      id: "svc-1",
      name: "Look up a client",
      description: "Finds a client in the registry.",
      project: "malawi-chw-referrals",
      projectPath: "/projects/p1/services/svc-1",
      badges: ["Live"],
      section: "Ministry of Health",
      callableAs: ["workflow", "mcp", "xroad"],
      mcpToolName: "client_registry_lookup",
    },
    {
      kind: "channel",
      id: "ch-1",
      name: "Birth registered",
      description: "Fires when a birth is registered.",
      channelType: "event",
      system: "OpenCRVS",
      systemPath: "/connected-systems/s1",
      section: "Ministry of Health",
    },
  ],
  usedServices: [
    {
      id: "u1",
      name: "Verify a national ID",
      description: "Checks an ID.",
      system: "National ID verification",
      systemPath: "/connected-systems/s2",
      adaptor: "http",
      connection: "xroad",
      xroadStatus: "live",
      owner: "Ministry of Interior",
      methods: ["POST /verify"],
    },
  ],
  mcpServerUrl: "https://app.openfn.org/mcp/ministry-of-health",
  projects: [{ id: "p1", name: "malawi-chw-referrals" }],
};

const actions = ["onStartWorkflow"] satisfies (keyof ServicesPageProps)[];

const frame = (d: ServicesPageData = data) => ({
  node: { id: "service-catalog", label: "Services" },
  ancestors: [],
  currentPath: "/service-catalog",
  data: d,
});

describe("ServicesPage", () => {
  it("lists the services we publish under who offers them, with the MCP server", () => {
    renderPage(ServicesPage, frame(), actions);
    expect(screen.getByText("Ministry of Health")).toBeTruthy();
    expect(screen.getByText("Look up a client")).toBeTruthy();
    expect(screen.getByText("https://app.openfn.org/mcp/ministry-of-health")).toBeTruthy();
  });

  it("lists the services we use, and what our systems offer, with a workflow to start on an event", () => {
    const host = renderPage(ServicesPage, frame(), actions);
    fireEvent.click(screen.getByRole("button", { name: /Services we use/ }));
    expect(screen.getByText("Verify a national ID")).toBeTruthy();
    expect(screen.getByText("Birth registered")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Create a workflow here" }));
    fireEvent.click(screen.getByRole("menuitem", { name: "malawi-chw-referrals" }));
    expect(host.calls("onStartWorkflow")).toEqual([["p1", "ch-1"]]);
  });

  it("offers nothing over X-Road when the organisation isn't on it", () => {
    renderPage(ServicesPage, frame({ ...data, xroad: false }), actions);
    expect(screen.queryByText("Offer them over X-Road")).toBeNull();
  });
});
