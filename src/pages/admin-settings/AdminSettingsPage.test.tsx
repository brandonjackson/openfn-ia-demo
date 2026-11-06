import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { FormError } from "../../model/form-error";
import type { AdminUser } from "../../model/users";
import { renderPage } from "../../test/renderPage";
import AdminSettingsPage, { type AdminSettingsPageData, type AdminSettingsPageProps } from "./AdminSettingsPage";

const user = (firstName: string, lastName: string, patch: Partial<AdminUser> = {}): AdminUser => ({
  id: `${firstName}-${lastName}`.toLowerCase(),
  firstName,
  lastName,
  email: `${firstName}@example.org`.toLowerCase(),
  role: "user",
  supportUser: false,
  disabled: false,
  canDelete: true,
  canDeleteNow: false,
  ...patch,
});

const data: AdminSettingsPageData = {
  users: [user("Amina", "Diallo", { role: "superuser", isSelf: true, canDelete: false }), user("Tomas", "Reyes")],
  projects: [],
  audit: { entries: [], total: 0, pageSize: 10, eventNames: [] },
  auditQuery: { search: "", event: "", itemType: "", page: 1 },
  instanceUrl: "https://openfn.example.org",
  collections: [],
  maintenance: [],
  usageMetricsEnabled: true,
  deletionGraceDays: 7,
};

const actions = [
  "onCreateUser",
  "onUpdateUser",
  "onSetUserDisabled",
  "onScheduleUserDeletion",
  "onCancelUserDeletion",
  "onCreateProject",
  "onUpdateProject",
  "onScheduleProjectDeletion",
  "onCancelProjectDeletion",
  "onChangeAuditQuery",
  "onTestAuthProvider",
  "onSaveAuthProvider",
  "onRemoveAuthProvider",
  "onDeleteCollection",
  "onRunMaintenance",
] satisfies (keyof AdminSettingsPageProps)[];

const draw = (section = "users", label = "Users", pageData: AdminSettingsPageData = data) =>
  renderPage(
    AdminSettingsPage,
    {
      node: { id: section, label, pageType: "admin-settings" },
      ancestors: [{ node: { id: "admin-settings", label: "Admin settings" }, path: "/admin-settings" }],
      currentPath: `/admin-settings/${section}`,
      data: pageData,
    },
    actions,
  );

const withProvider: AdminSettingsPageData = {
  ...data,
  authProvider: {
    name: "keycloak",
    discoveryUrl: "https://id.example.org/.well-known/openid-configuration",
    clientId: "openfn",
    hasClientSecret: true,
    redirectHost: "https://openfn.example.org",
    allowUnverifiedEmail: false,
  },
};

function fillInNewUser() {
  fireEvent.click(screen.getByRole("button", { name: "New user" }));
  fireEvent.change(screen.getByLabelText("First name"), { target: { value: "Lena" } });
  fireEvent.change(screen.getByLabelText("Last name"), { target: { value: "Okafor" } });
  fireEvent.change(screen.getByLabelText("Email"), { target: { value: "lena@example.org" } });
  fireEvent.change(screen.getByLabelText("Password"), { target: { value: "a long enough password" } });
  fireEvent.click(screen.getByRole("button", { name: "Create user" }));
}

describe("AdminSettingsPage", () => {
  it("lists every account on the instance", () => {
    draw();
    expect(screen.getByText("Amina Diallo")).toBeTruthy();
    expect(screen.getByText("Tomas Reyes")).toBeTruthy();
  });

  it("asks to create the account, waits while it's saved, then closes the form", async () => {
    const host = draw();
    fillInNewUser();
    expect(host.calls("onCreateUser")).toEqual([
      [{ firstName: "Lena", lastName: "Okafor", email: "lena@example.org", role: "user", supportUser: false, disabled: false, password: "a long enough password" }],
    ]);
    expect((screen.getByRole("button", { name: "Create user" }) as HTMLButtonElement).disabled).toBe(true);
    await host.resolve("onCreateUser");
    expect(screen.queryByLabelText("First name")).toBeNull();
  });

  it("keeps the form open, naming the field the server refused", async () => {
    const host = draw();
    fillInNewUser();
    await host.reject("onCreateUser", new FormError("The account could not be saved.", { email: ["has already been taken"] }));
    expect(screen.getByText("The account wasn't saved")).toBeTruthy();
    expect(screen.getByText("Email has already been taken.")).toBeTruthy();
    expect(screen.getByLabelText("First name")).toBeTruthy();
  });

  it("tests the provider's discovery URL and shows what came back", async () => {
    const host = draw("authentication", "Authentication", withProvider);
    fireEvent.click(screen.getByRole("button", { name: "Test" }));
    expect(screen.getByRole("button", { name: "Testing…" })).toBeTruthy();
    expect(host.calls("onTestAuthProvider")[0]![0].discoveryUrl).toBe("https://id.example.org/.well-known/openid-configuration");
    await host.resolve("onTestAuthProvider", { discoveryUrl: "https://id.example.org/.well-known/openid-configuration", ok: true, message: "Found the endpoints." });
    expect(screen.getByText("Discovery URL works")).toBeTruthy();
    expect(screen.getByText("Found the endpoints.")).toBeTruthy();
  });

  it("says why when the test is refused", async () => {
    const host = draw("authentication", "Authentication", withProvider);
    fireEvent.click(screen.getByRole("button", { name: "Test" }));
    await host.reject("onTestAuthProvider", new FormError("You are not allowed to do that."));
    expect(screen.getByText("Test failed")).toBeTruthy();
    expect(screen.getByText("You are not allowed to do that.")).toBeTruthy();
  });
});
