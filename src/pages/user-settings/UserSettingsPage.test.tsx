import { fireEvent, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { CredentialSchema } from "../../model/credentials";
import { renderPage } from "../../test/renderPage";
import UserSettingsPage, { type UserSettingsPageData, type UserSettingsPageProps } from "./UserSettingsPage";

const dhis2: CredentialSchema = {
  id: "dhis2",
  name: "DHIS2",
  adaptor: "dhis2",
  description: "District Health Information System",
  fields: [
    { key: "hostUrl", label: "Host URL", kind: "url", required: true },
    { key: "password", label: "Password", kind: "secret", required: true },
  ],
};

const data: UserSettingsPageData = {
  profile: { firstName: "Amina", lastName: "Diallo", email: "amina@example.org", createdAt: "12 March 2024", contactPreference: "Critical only", mfaEnabled: false, githubConnected: false },
  credentials: [
    { id: "c1", name: "Ministry DHIS2", schema: "dhis2", projectIds: [], environments: [{ environment: "production", values: { hostUrl: "https://dhis2.example.org" } }], createdAt: "1 Oct 2026" },
  ],
  credentialSchemas: [
    { id: "dhis2", name: "DHIS2", adaptor: "dhis2" },
    { id: "raw", name: "Raw JSON" },
  ],
  oauthClients: [],
  projects: [],
  apiTokens: [{ id: "t1", suffix: "a1b2", createdAt: "2 Oct 2026" }],
};

const actions = [
  "onSaveProfile",
  "onChangeEmail",
  "onChangePassword",
  "onStartMfaSetup",
  "onEnableMfa",
  "onDisableMfa",
  "onRegenerateBackupCodes",
  "onConnectGitHub",
  "onDisconnectGitHub",
  "onDeleteAccount",
  "onLoadCredentialSchema",
  "onSaveCredential",
  "onDeleteCredential",
  "onTransferCredential",
  "onRevokeCredentialTransfer",
  "onSaveOAuthClient",
  "onDeleteOAuthClient",
  "onGenerateToken",
  "onDeleteToken",
] satisfies (keyof UserSettingsPageProps)[];

const draw = (section: string, label: string, pageData: UserSettingsPageData = data) =>
  renderPage(
    UserSettingsPage,
    {
      node: { id: section, label, pageType: "user-settings" },
      ancestors: [{ node: { id: "user-settings", label: "User settings" }, path: "/user-settings" }],
      currentPath: `/user-settings/${section}`,
      data: pageData,
    },
    actions,
  );

type Host = ReturnType<typeof draw>;

/** Picks DHIS2 in the type picker and answers the fetch of its fields. */
async function pickDhis2(host: Host) {
  fireEvent.click(screen.getByRole("button", { name: "New credential" }));
  fireEvent.click(within(screen.getByRole("dialog")).getByText("DHIS2"));
  fireEvent.click(screen.getByRole("button", { name: "Configure credential" }));
  await host.resolve("onLoadCredentialSchema", dhis2);
}

async function fillInNewDhis2(host: Host) {
  await pickDhis2(host);
  fireEvent.change(screen.getByLabelText(/^Name/), { target: { value: "Health ministry" } });
  fireEvent.change(screen.getByLabelText(/^Host URL/), { target: { value: "https://play.dhis2.org" } });
  fireEvent.change(screen.getByLabelText(/^Password/), { target: { value: "district" } });
  fireEvent.click(screen.getByRole("button", { name: "Save credential" }));
}

describe("UserSettingsPage", () => {
  it("lists your credentials", () => {
    draw("credentials", "Credentials");
    expect(screen.getByText("Ministry DHIS2")).toBeTruthy();
  });

  it("offers the kinds of credential it's given, and asks for the fields of the one picked once they've loaded", async () => {
    const host = draw("credentials", "Credentials");
    fireEvent.click(screen.getByRole("button", { name: "New credential" }));
    expect(within(screen.getByRole("dialog")).getByText("Raw JSON")).toBeTruthy();
    fireEvent.click(within(screen.getByRole("dialog")).getByText("DHIS2"));
    fireEvent.click(screen.getByRole("button", { name: "Configure credential" }));
    expect(host.calls("onLoadCredentialSchema")).toEqual([["dhis2"]]);
    // Busy, not disabled, while the fields load: it keeps focus and says so.
    const busy = screen.getByRole("button", { name: "Loading…" });
    expect(busy.getAttribute("aria-disabled")).toBe("true");
    fireEvent.click(busy);
    expect(host.calls("onLoadCredentialSchema")).toHaveLength(1);
    await host.resolve("onLoadCredentialSchema", dhis2);
    expect(screen.getByLabelText(/^Host URL/)).toBeTruthy();
  });

  it("stays on the type picker with the server's reason when a type's fields can't load", async () => {
    const host = draw("credentials", "Credentials");
    fireEvent.click(screen.getByRole("button", { name: "New credential" }));
    fireEvent.click(within(screen.getByRole("dialog")).getByText("DHIS2"));
    fireEvent.click(screen.getByRole("button", { name: "Configure credential" }));
    await host.reject("onLoadCredentialSchema", new Error("Lightning is still loading the adaptors."));
    expect(screen.getByText("Lightning is still loading the adaptors.")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Configure credential" })).toBeTruthy();
    expect(screen.queryByLabelText(/^Host URL/)).toBeNull();
  });

  it("keeps the type it's loading when another is clicked mid-load", async () => {
    const host = draw("credentials", "Credentials");
    fireEvent.click(screen.getByRole("button", { name: "New credential" }));
    const picker = within(screen.getByRole("dialog"));
    fireEvent.click(picker.getByText("DHIS2"));
    fireEvent.click(screen.getByRole("button", { name: "Configure credential" }));
    fireEvent.click(picker.getByText("Raw JSON"));
    expect(picker.getByRole("button", { name: /DHIS2/ }).getAttribute("aria-pressed")).toBe("true");
    await host.resolve("onLoadCredentialSchema", dhis2);
    expect(screen.getByRole("dialog", { name: "Create DHIS2 credential" })).toBeTruthy();
    expect(document.activeElement).toBe(screen.getByLabelText(/^Name/));
  });

  it("says why when a credential's fields can't load for editing", async () => {
    const host = draw("credentials", "Credentials");
    fireEvent.click(screen.getByRole("button", { name: "Actions for Ministry DHIS2" }));
    fireEvent.click(screen.getByRole("menuitem", { name: "Edit" }));
    await host.reject("onLoadCredentialSchema", new Error("Lightning is still loading the adaptors."));
    expect(screen.getByRole("alert").textContent).toContain("Lightning is still loading the adaptors.");
    expect(screen.queryByLabelText(/^Host URL/)).toBeNull();
  });

  it("fetches a credential's fields as its form opens for editing", async () => {
    const host = draw("credentials", "Credentials");
    fireEvent.click(screen.getByRole("button", { name: "Actions for Ministry DHIS2" }));
    fireEvent.click(screen.getByRole("menuitem", { name: "Edit" }));
    expect(host.calls("onLoadCredentialSchema")).toEqual([["dhis2"]]);
    expect(screen.queryByLabelText(/^Host URL/)).toBeNull();
    await host.resolve("onLoadCredentialSchema", dhis2);
    expect((screen.getByLabelText(/^Host URL/) as HTMLInputElement).value).toBe("https://dhis2.example.org");
  });

  it("saves a new credential, waits while it's saved, then closes the form", async () => {
    const host = draw("credentials", "Credentials");
    await fillInNewDhis2(host);
    const [draft] = host.calls("onSaveCredential")[0]!;
    expect(draft).toMatchObject({ name: "Health ministry", schema: "dhis2" });
    expect(draft.environments[0]!.values).toMatchObject({ hostUrl: "https://play.dhis2.org", password: "district" });
    expect(screen.getByRole("button", { name: "Saving…" })).toBeTruthy();
    await host.resolve("onSaveCredential");
    expect(screen.queryByRole("button", { name: "Save credential" })).toBeNull();
  });

  it("keeps the form open with the server's reason when it refuses the credential", async () => {
    const host = draw("credentials", "Credentials");
    await fillInNewDhis2(host);
    await host.reject("onSaveCredential", new Error("Name has already been taken."));
    expect(screen.getByText("Name has already been taken.")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Save credential" })).toBeTruthy();
  });

  it("asks for a type when Configure credential is pressed with none picked", () => {
    const host = draw("credentials", "Credentials");
    fireEvent.click(screen.getByRole("button", { name: "New credential" }));
    fireEvent.click(screen.getByRole("button", { name: "Configure credential" }));
    expect(screen.getByRole("alert").textContent).toContain("Choose a credential type");
    expect(document.activeElement).toBe(screen.getByPlaceholderText("Search credential types"));
    expect(host.calls("onLoadCredentialSchema")).toEqual([]);
  });

  it("says what's missing and focuses it when a password change is sent empty", () => {
    const host = draw("profile", "Profile");
    fireEvent.click(screen.getByRole("button", { name: "Update password" }));
    expect(document.activeElement).toBe(screen.getByLabelText(/^New password/));
    expect(host.calls("onChangePassword")).toEqual([]);
  });

  it("shows a new token once, when it's been made", async () => {
    const host = draw("api-tokens", "API tokens");
    fireEvent.click(screen.getByRole("button", { name: "Generate new token" }));
    await host.resolve("onGenerateToken", "openfn_token_secret");
    expect(screen.getByText("Copy your token now. You won't be able to see it again.")).toBeTruthy();
  });

  it("deletes a token once you confirm, closing the confirm when it's gone", async () => {
    const host = draw("api-tokens", "API tokens");
    fireEvent.click(screen.getByRole("button", { name: "Delete token ending a1b2" }));
    fireEvent.click(screen.getByRole("button", { name: "Delete token" }));
    expect(host.calls("onDeleteToken")).toEqual([["t1"]]);
    await host.resolve("onDeleteToken");
    expect(screen.queryByRole("button", { name: "Delete token" })).toBeNull();
  });
});
