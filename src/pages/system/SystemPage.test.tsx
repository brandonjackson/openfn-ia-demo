import { fireEvent, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { ConnectedSystem } from "../../model/connected-systems";
import type { XRoadIdentity, XRoadMember } from "../../model/xroad";
import { FormError } from "../../model/form-error";
import { renderPage } from "../../test/renderPage";
import SystemPage, { type SystemPageData, type SystemPageProps } from "./SystemPage";

const direct: ConnectedSystem = {
  id: "0d6f4a52-1c1e-4b35-9a43-5b0b7c1e2a10",
  name: "DHIS2",
  description: "Health information management system.",
  credentialType: "org",
  hasAccess: true,
  color: "gray",
  adaptor: "dhis2",
  owner: "Acme Health Ministry",
  ownerType: "org",
  environments: {
    production: { url: "https://dhis2.example.org", credential: "dhis2-prod" },
    staging: { url: undefined, credential: undefined },
    mock: { url: undefined, credential: undefined },
  },
};

const viaXRoad: ConnectedSystem = {
  ...direct,
  id: "5a0e7f0c-3a8b-4f0e-8f2a-6d1f9b2c3d44",
  name: "National ID verification",
  credentialType: "user",
  owner: "Ministry of Interior",
  connection: {
    method: "xroad",
    route: { memberId: "moi", subsystem: "IDENTITY", service: "verify-national-id" },
    status: "live",
    history: [{ status: "live", date: "1 Oct 2026" }],
    accessCheckedAt: "Just now",
    allowedMethods: ["POST /verify"],
  },
};

const identity: XRoadIdentity = {
  instance: "FJ",
  memberClass: "GOV",
  memberCode: "MOH",
  memberName: "Ministry of Health",
  subsystems: [{ code: "OPENFN", description: "Workflows", openfn: true }],
  certificates: [],
  securityServers: [{ id: "ss1", code: "SS1", address: "ss1.moh.gov.fj", version: "7.4", enabled: true, lastSeen: "Just now" }],
};

const moi: XRoadMember = {
  id: "moi",
  name: "Ministry of Interior",
  memberClass: "GOV",
  memberCode: "MOI",
  subsystems: [{ code: "IDENTITY", description: "The population register.", services: [] }],
};

const data: SystemPageData = {
  system: direct,
  accessGrants: [{ id: "g1", grantedTo: "Project A", grantedToType: "project", scope: "All Resources", lastAccessed: null }],
};

const actions = ["onRevokeGrant", "onSaveSystem", "onDeleteSystem"] satisfies (keyof SystemPageProps)[];

const frame = (d: SystemPageData = data) => ({
  node: { id: d.system.id, label: d.system.name, description: d.system.description },
  ancestors: [],
  currentPath: `/connected-systems/${d.system.id}`,
  data: d,
});

describe("SystemPage", () => {
  it("shows a shared system reached directly, its environments and who has access", () => {
    renderPage(SystemPage, frame(), actions);
    expect(screen.getByRole("heading", { name: "DHIS2" })).toBeTruthy();
    expect(screen.getByText("Shared")).toBeTruthy();
    expect(screen.getByText("Environments")).toBeTruthy();
    expect(screen.getByText("Project A")).toBeTruthy();
  });

  it("says a system is private from its credential type", () => {
    renderPage(SystemPage, frame({ ...data, system: { ...direct, credentialType: "user" } }), actions);
    expect(screen.getByText("Private")).toBeTruthy();
  });

  it("shows where an X-Road system's route goes once it's known, and no environments", () => {
    renderPage(SystemPage, frame({ system: viaXRoad, xroad: { org: identity, member: moi }, accessGrants: [] }), actions);
    expect(screen.queryByText("Environments")).toBeNull();
    expect(screen.getAllByText(/FJ\/GOV\/MOI/).length).toBeGreaterThan(0);
  });

  it("revokes a grant, waiting while it's revoked", async () => {
    const host = renderPage(SystemPage, frame(), actions);
    fireEvent.click(screen.getByRole("button", { name: "Revoke" }));
    const dialog = screen.getByRole("dialog");
    fireEvent.click(within(dialog).getByRole("button", { name: "Revoke" }));
    expect(host.calls("onRevokeGrant")).toEqual([["g1"]]);
    expect(within(dialog).getByRole("button", { name: "Revoking…" }).getAttribute("aria-disabled")).toBe("true");
    fireEvent.click(within(dialog).getByRole("button", { name: "Revoking…" }));
    expect(host.calls("onRevokeGrant")).toHaveLength(1);
    await host.resolve("onRevokeGrant");
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("closes the confirm and keeps the grant when the server refuses to revoke it (the wrapper says why)", async () => {
    const host = renderPage(SystemPage, frame(), actions);
    fireEvent.click(screen.getByRole("button", { name: "Revoke" }));
    fireEvent.click(within(screen.getByRole("dialog")).getByRole("button", { name: "Revoke" }));
    await host.reject("onRevokeGrant", new FormError("That grant is already gone."));
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(screen.getByText("Project A")).toBeTruthy();
  });

  it("deletes the system once its name is typed, waiting while it's deleted", async () => {
    const host = renderPage(SystemPage, frame(), actions);
    fireEvent.click(screen.getByRole("button", { name: "Delete system" }));
    const dialog = screen.getByRole("dialog");
    fireEvent.change(within(dialog).getByLabelText("Type the system's name to confirm"), { target: { value: "DHIS2" } });
    fireEvent.click(within(dialog).getByRole("button", { name: "Delete system" }));
    expect(host.calls("onDeleteSystem")).toHaveLength(1);
    expect(within(dialog).getByRole("button", { name: "Deleting…" })).toBeTruthy();
    await host.reject("onDeleteSystem", new FormError("Workflows still use it."));
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("edits one environment's URL from its Edit, keeping the rest of the system", async () => {
    const host = renderPage(SystemPage, frame(), actions);
    fireEvent.click(screen.getByRole("button", { name: "Edit staging" }));
    const dialog = screen.getByRole("dialog", { name: "Edit staging" });
    expect(within(dialog).queryByLabelText(/^Name/)).toBeNull();
    expect(within(dialog).queryByLabelText(/Production URL/)).toBeNull();
    fireEvent.change(within(dialog).getByLabelText(/Staging URL/), { target: { value: "https://staging.dhis2.example.org" } });
    fireEvent.click(within(dialog).getByRole("button", { name: "Save" }));
    expect(host.calls("onSaveSystem")[0]![0]).toMatchObject({
      name: "DHIS2",
      urls: { production: "https://dhis2.example.org", staging: "https://staging.dhis2.example.org", mock: "" },
    });
    expect(within(dialog).getByRole("button", { name: "Saving…" }).getAttribute("aria-disabled")).toBe("true");
    await host.reject("onSaveSystem", new FormError("The request body is not valid.", { "environments.staging.url": ["must be an http or https URL"] }));
    expect(within(dialog).getByText("must be an http or https URL")).toBeTruthy();
    fireEvent.click(within(dialog).getByRole("button", { name: "Save" }));
    await host.resolve("onSaveSystem");
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("links to the system's OpenAPI spec, and edits it with the system", () => {
    const host = renderPage(SystemPage, frame({ ...data, system: { ...direct, openApiSpecUrl: "https://dhis2.example.org/api/openapi.json" } }), actions);
    expect(screen.getByRole("link", { name: "https://dhis2.example.org/api/openapi.json" })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Edit" }));
    const field = screen.getByLabelText(/OpenAPI spec/) as HTMLInputElement;
    expect(field.value).toBe("https://dhis2.example.org/api/openapi.json");
    fireEvent.change(field, { target: { value: "" } });
    fireEvent.change(screen.getByLabelText(/^Name/), { target: { value: "" } });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    expect(screen.getByText("Enter a name")).toBeTruthy();
    expect(host.calls("onSaveSystem")).toHaveLength(0);
    fireEvent.change(screen.getByLabelText(/^Name/), { target: { value: "DHIS2" } });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    expect(host.calls("onSaveSystem")[0]![0]).toMatchObject({ openApiSpecUrl: "" });
  });

  it("leaves out Edit, Delete and Revoke for someone who can't change the system", () => {
    // An X-Road system, which has no environments with their own Edit.
    renderPage(SystemPage, frame({ ...data, system: viaXRoad, xroad: { org: identity, member: moi } }), []);
    expect(screen.queryByRole("button", { name: "Edit" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Delete system" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Revoke" })).toBeNull();
  });
});
