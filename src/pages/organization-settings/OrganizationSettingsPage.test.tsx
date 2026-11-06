import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { FormError } from "../../model/form-error";
import { renderPage } from "../../test/renderPage";
import OrganizationSettingsPage, { type OrganizationSettingsPageData, type OrganizationSettingsPageProps } from "./OrganizationSettingsPage";

const data: OrganizationSettingsPageData = {
  name: "Ministry of Health",
  members: [
    { id: "m1", name: "Amina Diallo", email: "amina@example.org", role: "Owner", lastActive: "Today" },
    { id: "m2", name: "Tomas Reyes", email: "tomas@example.org", role: "Member", lastActive: "Yesterday" },
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

function invite(email: string) {
  fireEvent.click(screen.getByRole("button", { name: "Invite member" }));
  fireEvent.change(screen.getByLabelText(/^Email/), { target: { value: email } });
  fireEvent.click(screen.getByRole("button", { name: "Send invitation" }));
}

describe("OrganizationSettingsPage", () => {
  it("lists the organisation's members", () => {
    draw();
    expect(screen.getByText("Amina Diallo")).toBeTruthy();
    expect(screen.getByText("Tomas Reyes")).toBeTruthy();
  });

  it("sends an invitation, waits while it's sent, then closes the form", async () => {
    const host = draw();
    invite("new.person@example.org");
    expect(host.calls("onInviteMember")).toEqual([[{ email: "new.person@example.org", role: "Member" }]]);
    expect(screen.getByRole("button", { name: "Sending…" }).getAttribute("aria-disabled")).toBe("true");
    await host.resolve("onInviteMember");
    expect(screen.queryByRole("button", { name: "Send invitation" })).toBeNull();
  });

  it("keeps the form open, saying why under the email, when the server refuses it", async () => {
    const host = draw();
    invite("tomas@example.org");
    await host.reject("onInviteMember", new FormError("The invitation could not be sent.", { email: ["is already in the organisation"] }));
    expect(screen.getByText(/is already in the organisation/)).toBeTruthy();
    expect(screen.getByRole("button", { name: "Send invitation" })).toBeTruthy();
  });

  it("says what's missing under the email when an invitation is sent without one, and sends nothing", () => {
    const host = draw();
    fireEvent.click(screen.getByRole("button", { name: "Invite member" }));
    fireEvent.click(screen.getByRole("button", { name: "Send invitation" }));
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

  it("reads only, with no invite button, when it's given no actions", () => {
    renderPage(OrganizationSettingsPage, frame("members", "Members", data), []);
    expect(screen.queryByRole("button", { name: "Invite member" })).toBeNull();
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
