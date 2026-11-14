import { fireEvent, screen, waitFor, within } from "@testing-library/react";
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
  "onRename",
  "onInviteMember",
  "onChangeMemberRole",
  "onRemoveMember",
  "onSaveVisibility",
  "onSaveSecurityServerManager",
  "onSaveLogo",
  "onRemoveLogo",
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
  it("renames the organisation, waits while it's saved, then says so", async () => {
    const host = draw("general", "General");
    fireEvent.change(screen.getByLabelText(/^Organization name/), { target: { value: "  Ministry of Health and Wellness " } });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    expect(host.calls("onRename")).toEqual([["Ministry of Health and Wellness"]]);
    expect(screen.getByRole("button", { name: "Saving…" }).getAttribute("aria-disabled")).toBe("true");
    fireEvent.click(screen.getByRole("button", { name: "Saving…" }));
    expect(host.calls("onRename")).toHaveLength(1);
    await host.resolve("onRename");
    expect(screen.getByRole("button", { name: "Save" })).toBeTruthy();
  });

  it("says a name is missing when it's saved without one, and sends nothing", () => {
    const host = draw("general", "General");
    fireEvent.change(screen.getByLabelText(/^Organization name/), { target: { value: "  " } });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    expect(screen.getByText("Enter a name for the organisation")).toBeTruthy();
    expect(document.activeElement).toBe(screen.getByLabelText(/^Organization name/));
    expect(host.calls("onRename")).toEqual([]);
  });

  it("says why under the name when the server refuses it", async () => {
    const host = draw("general", "General");
    fireEvent.change(screen.getByLabelText(/^Organization name/), { target: { value: "x".repeat(200) } });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    await host.reject("onRename", new FormError("The request body is not valid.", { name: ["should be at most 160 character(s)"] }));
    expect(screen.getByText(/should be at most 160 character/)).toBeTruthy();
  });

  it("shows the name to read, with no Save, when it can't be changed", () => {
    renderPage(OrganizationSettingsPage, frame("general", "General", data), []);
    expect((screen.getByLabelText(/^Organization name/) as HTMLInputElement).value).toBe("Ministry of Health");
    expect(screen.queryByRole("button", { name: "Save" })).toBeNull();
  });

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

  it("asks for a role change, and takes a refusal quietly (the wrapper says why)", async () => {
    const host = draw();
    fireEvent.click(screen.getByRole("button", { name: "Actions for Amina Diallo" }));
    fireEvent.click(screen.getByRole("menuitem", { name: "Make member" }));
    expect(host.calls("onChangeMemberRole")).toEqual([["m1", "Member"]]);
    await host.reject("onChangeMemberRole", new FormError("The request body is not valid.", { role: ["would leave the organization with no admin"] }));
    expect(screen.getByText("Amina Diallo")).toBeTruthy();
  });

  it("says what's missing under the email when someone is added without one, and sends nothing", () => {
    const host = draw();
    fireEvent.click(screen.getByRole("button", { name: "Add member" }));
    fireEvent.click(within(screen.getByRole("dialog")).getByRole("button", { name: "Add member" }));
    expect(screen.getByText("Enter an email address")).toBeTruthy();
    expect(document.activeElement).toBe(screen.getByLabelText(/^Email/));
    expect(host.calls("onInviteMember")).toEqual([]);
  });

  it("calls the members' role their org role", () => {
    draw();
    expect(screen.getByRole("columnheader", { name: "Org role" })).toBeTruthy();
  });

  it("has no Context section", () => {
    draw("general", "General");
    expect(screen.queryByRole("link", { name: "Context" })).toBeNull();
  });

  it("uploads a logo as a data URL, says under the field why it was refused, and refuses a file that isn't an image", async () => {
    const host = draw("general", "General");
    const input = document.querySelector<HTMLInputElement>('input[type="file"]')!;
    fireEvent.change(input, { target: { files: [new File(["hello"], "notes.txt", { type: "text/plain" })] } });
    expect(await screen.findByText("Pick a PNG, JPEG, SVG or WebP image")).toBeTruthy();
    expect(host.calls("onSaveLogo")).toEqual([]);
    fireEvent.change(input, { target: { files: [new File(["<svg/>"], "logo.svg", { type: "image/svg+xml" })] } });
    await waitFor(() => expect(host.calls("onSaveLogo")).toHaveLength(1));
    expect(host.calls("onSaveLogo")[0]![0]).toMatch(/^data:image\/svg\+xml;base64,/);
    expect(screen.getByText("Uploading…")).toBeTruthy();
    await host.reject("onSaveLogo", new FormError("The request body is not valid.", { logo: ["must be 256 KB or smaller"] }));
    expect(screen.getByText("must be 256 KB or smaller")).toBeTruthy();
  });

  it("shows the logo with Remove, or the initials without one", async () => {
    const host = draw("general", "General", { ...data, logo: "data:image/png;base64,AAAA" });
    expect(screen.getByRole("img", { name: "Ministry of Health logo" })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Remove" }));
    expect(host.calls("onRemoveLogo")).toHaveLength(1);
    expect(screen.getByRole("button", { name: "Removing…" }).getAttribute("aria-disabled")).toBe("true");
    await host.resolve("onRemoveLogo");
    draw("general", "General");
    expect(screen.getByText("MH")).toBeTruthy();
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

  it("saves who manages the Security Server, waits while it's saved, and lets it be saved again after a refusal", async () => {
    const host = draw("xroad", "X-Road", onXRoad);
    fireEvent.click(screen.getByLabelText(/^National operator/));
    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    expect(host.calls("onSaveSecurityServerManager")).toEqual([["national-operator"]]);
    expect(screen.getByRole("button", { name: "Saving…" }).getAttribute("aria-disabled")).toBe("true");
    await host.reject("onSaveSecurityServerManager", new Error("You are not allowed to do that."));
    expect(screen.getByRole("button", { name: "Save" }).getAttribute("aria-disabled")).not.toBe("true");
  });
});
