import { fireEvent, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { FormError } from "../../model/form-error";
import { renderPage } from "../../test/renderPage";
import OrganizationSettingsPage, { type OrganizationSettingsPageData, type OrganizationSettingsPageProps } from "./OrganizationSettingsPage";

const data: OrganizationSettingsPageData = {
  name: "Ministry of Health",
  members: [
    { id: "m1", name: "Amina Diallo", email: "amina@example.org", role: "Admin", joined: "6 months ago" },
    { id: "m2", name: "Tomas Reyes", email: "tomas@example.org", role: "Member", joined: "3 days ago" },
  ],
  visibility: { projects: "project" },
  contextLayers: [],
  xroadUsage: { systems: 0, services: 0 },
  billing: { plan: "Core", price: "$1,200 / month", renewsOn: "1 Nov 2026", runsUsed: 100, runsIncluded: 1000, invoices: [] },
};

const onXRoad: OrganizationSettingsPageData = {
  ...data,
  xroad: {
    instance: "FJ",
    memberClass: "GOV",
    memberCode: "MOH",
    memberName: "Ministry of Health",
    subsystems: [{ code: "OPENFN", description: "Workflow services published from OpenFn.", openfn: true }],
    certificates: [],
    securityServers: [],
    managedBy: "this-org",
  },
};

const actions = [
  "onInviteMember",
  "onChangeMemberRole",
  "onRemoveMember",
  "onSaveVisibility",
  "onSaveSecurityServerManager",
  "onRequestContextAccess",
  "onRemoveContextLayer",
] satisfies (keyof OrganizationSettingsPageProps)[];

const frame = (section: string, label: string, pageData: OrganizationSettingsPageData) => ({
  node: { id: section, label, pageType: "organization-settings" as const },
  ancestors: [{ node: { id: "organization-settings", label: "Organization settings" }, path: "/organization-settings" }],
  currentPath: `/organization-settings/${section}`,
  data: pageData,
});

const draw = (section = "members", label = "Members", pageData = data) =>
  renderPage(OrganizationSettingsPage, { ...frame(section, label, pageData), assignableRoles: ["Admin", "Member"] }, actions);

function add(email: string) {
  fireEvent.click(screen.getByRole("button", { name: "Add member" }));
  fireEvent.change(screen.getByLabelText(/^Email/), { target: { value: email } });
  fireEvent.click(within(screen.getByRole("dialog")).getByRole("button", { name: "Add member" }));
}

describe("OrganizationSettingsPage", () => {
  it("lists the organisation's members, with when they joined", () => {
    draw();
    expect(screen.getByText("Amina Diallo")).toBeTruthy();
    expect(screen.getByText("Tomas Reyes")).toBeTruthy();
    expect(screen.getByText("3 days ago")).toBeTruthy();
  });

  it("adds someone, waits while they're added, then closes the form", async () => {
    const host = draw();
    add("new.person@example.org");
    expect(host.calls("onInviteMember")).toEqual([[{ email: "new.person@example.org", role: "Member" }]]);
    expect(screen.getByRole("button", { name: "Adding…" }).getAttribute("aria-disabled")).toBe("true");
    await host.resolve("onInviteMember");
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("keeps the form open, saying why under the email, when the server refuses it", async () => {
    const host = draw();
    add("tomas@example.org");
    await host.reject("onInviteMember", new FormError("The request body is not valid.", { email: ["is already a member of the organization"] }));
    expect(screen.getByText(/is already a member of the organization/)).toBeTruthy();
    expect(screen.getByRole("dialog")).toBeTruthy();
  });

  it("says what the server refused when a role change would leave no admin", async () => {
    const host = draw();
    fireEvent.click(screen.getByRole("button", { name: "Actions for Amina Diallo" }));
    fireEvent.click(screen.getByRole("menuitem", { name: "Make member" }));
    expect(host.calls("onChangeMemberRole")).toEqual([["m1", "Member"]]);
    await host.reject("onChangeMemberRole", new FormError("The request body is not valid.", { role: ["would leave the organization with no admin"] }));
    expect(screen.getByText("That didn't change")).toBeTruthy();
  });

  it("says what's missing under the email when someone is added without one, and sends nothing", () => {
    const host = draw();
    fireEvent.click(screen.getByRole("button", { name: "Add member" }));
    fireEvent.click(within(screen.getByRole("dialog")).getByRole("button", { name: "Add member" }));
    expect(screen.getByText("Enter an email address")).toBeTruthy();
    expect(document.activeElement).toBe(screen.getByLabelText(/^Email/));
    expect(host.calls("onInviteMember")).toEqual([]);
  });

  it("says a context layer URL is missing when access is requested without one", () => {
    const host = draw("context", "Context");
    fireEvent.click(screen.getByRole("button", { name: "Request access" }));
    expect(screen.getByText("Enter a context layer URL")).toBeTruthy();
    expect(document.activeElement).toBe(screen.getByLabelText(/^Context layer URL/));
    expect(host.calls("onRequestContextAccess")).toEqual([]);
  });

  it("reads only, with no add button, when it's given no actions", () => {
    renderPage(OrganizationSettingsPage, frame("members", "Members", data), []);
    expect(screen.queryByRole("button", { name: "Add member" })).toBeNull();
  });

  it("leaves out the X-Road section's identity when the organisation isn't on X-Road", () => {
    draw("xroad", "X-Road");
    expect(screen.queryByText("Member code")).toBeNull();
    draw("xroad", "X-Road", onXRoad);
    expect(screen.getByText("Member code")).toBeTruthy();
  });

  it("saves who manages the Security Server, waits while it's saved, and says why when it's refused", async () => {
    const host = draw("xroad", "X-Road", onXRoad);
    fireEvent.click(screen.getByLabelText(/^National operator/));
    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    expect(host.calls("onSaveSecurityServerManager")).toEqual([["national-operator"]]);
    expect(screen.getByRole("button", { name: "Saving…" }).getAttribute("aria-disabled")).toBe("true");
    await host.reject("onSaveSecurityServerManager", new Error("You are not allowed to do that."));
    expect(screen.getByText("The X-Road settings weren't saved")).toBeTruthy();
    expect(screen.getByText("You are not allowed to do that.")).toBeTruthy();
  });
});
