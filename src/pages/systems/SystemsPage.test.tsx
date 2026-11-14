import { fireEvent, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { SystemListItem } from "../../model/connected-systems";
import { FormError } from "../../model/form-error";
import type { XRoadMember } from "../../model/xroad";
import { renderPage } from "../../test/renderPage";
import SystemsPage, { type SystemsPageData, type SystemsPageProps } from "./SystemsPage";

const item = (name: string, access: "yes" | "no"): SystemListItem => ({
  id: `${name.toLowerCase()}-0000-4000-8000-000000000000`,
  name,
  description: `${name} system`,
  metadata: { access, adaptor: "http", connection: "direct" },
});

const moi: XRoadMember = {
  id: "moi",
  name: "Ministry of Interior",
  memberClass: "GOV",
  memberCode: "MOI",
  subsystems: [{ code: "IDENTITY", description: "Population register", services: [{ code: "verify-national-id", name: "Verify a national ID", description: "Checks an ID.", methods: ["POST /verify"] }] }],
};

const data: SystemsPageData = {
  items: [item("DHIS2", "yes"), item("KoBoToolbox", "no")],
  catalog: {
    adaptors: [
      { id: "dhis2", name: "DHIS2", description: "Health information", version: "1.0.0" },
      { id: "http", name: "HTTP", description: "Any HTTP API", version: "1.0.0" },
      { id: "common", name: "Common", description: "Helpers", version: "1.0.0" },
      { id: "claude", name: "Claude", description: "AI model", version: "1.0.0" },
    ],
    categories: [{ id: "health", label: "Health", groups: [{ label: "Records", adaptors: ["dhis2"] }] }],
    builtInTools: ["common", "http"],
    aiModels: ["claude"],
    aiActions: [{ id: "summarize", label: "Summarize", description: "Shorten it", body: "" }],
  },
  suggestions: [{ name: "RapidPro", description: "SMS and chat flows", adaptor: "rapidpro" }],
};

const withDirectory: SystemsPageData = {
  ...data,
  xroad: { directory: [moi], instance: "FJ", added: [], syncedAt: new Date(Date.now() - 12 * 60_000).toISOString() },
};

const actions = ["onAddXRoadService", "onAddSystem"] satisfies (keyof SystemsPageProps)[];

const frame = (d: SystemsPageData = data) => ({
  node: { id: "connected-systems", label: "Systems" },
  ancestors: [],
  currentPath: "/connected-systems",
  data: d,
});

describe("SystemsPage", () => {
  it("lists the systems and filters them by access", () => {
    renderPage(SystemsPage, frame(), actions);
    expect(screen.getByText("DHIS2")).toBeTruthy();
    expect(screen.getByText("KoBoToolbox")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "No access" }));
    expect(screen.queryByText("DHIS2")).toBeNull();
    expect(screen.getByText("KoBoToolbox")).toBeTruthy();
  });

  it("offers the ecosystem view only when there's a map", () => {
    renderPage(SystemsPage, frame(), actions);
    expect(screen.queryByRole("button", { name: "Ecosystem" })).toBeNull();
  });

  it("says when the directory was last listed, from its time", () => {
    renderPage(SystemsPage, frame(withDirectory), actions);
    expect(screen.getByText(/Synced from the X-Road directory 12 minutes ago/)).toBeTruthy();
  });

  it("adds a service from the X-Road directory, once at a time, and lets it be tried again after a refusal", async () => {
    const host = renderPage(SystemsPage, frame(withDirectory), actions);
    fireEvent.click(within(screen.getByRole("region", { name: "Ministry of Interior" })).getByRole("button", { name: "Add" }));
    expect(host.calls("onAddXRoadService")).toEqual([[{ memberId: "moi", subsystem: "IDENTITY", service: "verify-national-id" }]]);
    const busy = screen.getByRole("button", { name: "Adding…" });
    expect(busy.getAttribute("aria-disabled")).toBe("true");
    fireEvent.click(busy);
    expect(host.calls("onAddXRoadService")).toHaveLength(1);
    await host.reject("onAddXRoadService", new FormError("There's already a system called that."));
    expect(within(screen.getByRole("region", { name: "Ministry of Interior" })).getByRole("button", { name: "Add" })).toBeTruthy();
  });

  it("connects a system from the same picker as Add a step, with only what a system can be", async () => {
    const host = renderPage(SystemsPage, frame(), actions);
    fireEvent.click(screen.getByRole("button", { name: "Add system" }));
    const picker = screen.getByRole("dialog", { name: "Connect a system" });
    expect(within(picker).queryByRole("button", { name: "AI" })).toBeNull();
    expect(within(picker).queryByRole("button", { name: "Connected" })).toBeNull();
    // Search finds systems, HTTP for any other API, but not the built-in tools or AI actions.
    fireEvent.change(within(picker).getByRole("searchbox"), { target: { value: "h" } });
    expect(within(picker).getByRole("button", { name: /HTTP/ })).toBeTruthy();
    expect(within(picker).queryByRole("button", { name: /Common/ })).toBeNull();
    expect(within(picker).queryByRole("button", { name: /Summarize/ })).toBeNull();
    fireEvent.click(within(picker).getByRole("button", { name: /DHIS2/ }));
    const form = screen.getByRole("dialog", { name: "Connect DHIS2" });
    fireEvent.change(within(form).getByLabelText(/OpenAPI spec/), { target: { value: "https://dhis2.example.org/api/openapi.json" } });
    fireEvent.click(within(form).getByRole("button", { name: "Add connected system" }));
    expect(host.calls("onAddSystem")[0]![0]).toMatchObject({ name: "DHIS2", adaptor: "dhis2", openApiSpecUrl: "https://dhis2.example.org/api/openapi.json" });
    await host.reject("onAddSystem", new FormError("The request body is not valid.", { name: ["has already been taken"] }));
    expect(within(form).getByText("has already been taken")).toBeTruthy();
  });

  it("says what a name needs, under it, when the form is sent without one", () => {
    const host = renderPage(SystemsPage, frame(), actions);
    fireEvent.click(screen.getByRole("button", { name: "Add system" }));
    fireEvent.click(within(screen.getByRole("dialog")).getByRole("button", { name: /DHIS2/ }));
    fireEvent.change(screen.getByLabelText(/^Name/), { target: { value: " " } });
    fireEvent.click(screen.getByRole("button", { name: "Add connected system" }));
    expect(screen.getByText("Enter a name")).toBeTruthy();
    expect(host.calls("onAddSystem")).toHaveLength(0);
  });

  it("shows how an X-Road system's connection stands without calling it Live, and tags a system with an OpenAPI spec", () => {
    renderPage(
      SystemsPage,
      frame({
        ...data,
        items: [{ ...item("Population register", "yes"), metadata: { access: "yes", adaptor: "http", connection: "xroad", xroadStatus: "live", openApiSpecUrl: "https://x.example.org/openapi.json" } }],
      }),
      actions,
    );
    expect(screen.getByText("Connected")).toBeTruthy();
    expect(screen.queryByText("Live")).toBeNull();
    expect(screen.getByText("OpenAPI")).toBeTruthy();
  });

  it("leaves out the directory for an organisation not on X-Road", () => {
    renderPage(SystemsPage, frame(), actions);
    expect(screen.queryByText("Available via X-Road")).toBeNull();
  });
});
