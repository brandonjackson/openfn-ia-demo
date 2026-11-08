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
  adaptors: [{ id: "http", name: "HTTP", description: "Any HTTP API", category: "Generic" }],
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

  it("adds a service from the X-Road directory, and says why if the server refuses", async () => {
    const host = renderPage(SystemsPage, frame(withDirectory), actions);
    fireEvent.click(within(screen.getByRole("region", { name: "Ministry of Interior" })).getByRole("button", { name: "Add" }));
    expect(host.calls("onAddXRoadService")).toEqual([[{ memberId: "moi", subsystem: "IDENTITY", service: "verify-national-id" }]]);
    const busy = screen.getByRole("button", { name: "Adding…" });
    expect(busy.getAttribute("aria-disabled")).toBe("true");
    fireEvent.click(busy);
    expect(host.calls("onAddXRoadService")).toHaveLength(1);
    await host.reject("onAddXRoadService", new FormError("There's already a system called that."));
    expect(screen.getByRole("alert").textContent).toContain("Verify a national ID wasn't added");
    expect(screen.getByRole("alert").textContent).toContain("There's already a system called that.");
  });

  it("leaves out the directory for an organisation not on X-Road", () => {
    renderPage(SystemsPage, frame(), actions);
    expect(screen.queryByText("Available via X-Road")).toBeNull();
  });
});
