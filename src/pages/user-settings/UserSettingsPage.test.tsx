import { fireEvent, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { rawCredentialSchema, type CredentialSchema } from "../../model/credentials";
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
  credentialSchemas: [dhis2, rawCredentialSchema],
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

function fillInNewDhis2() {
  fireEvent.click(screen.getByRole("button", { name: "New credential" }));
  fireEvent.click(within(screen.getByRole("dialog")).getByText("DHIS2"));
  fireEvent.click(screen.getByRole("button", { name: "Configure credential" }));
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

  it("offers the kinds of credential it's given, and asks for the fields of the one picked", () => {
    draw("credentials", "Credentials");
    fireEvent.click(screen.getByRole("button", { name: "New credential" }));
    expect(within(screen.getByRole("dialog")).getByText("Raw JSON")).toBeTruthy();
    fireEvent.click(within(screen.getByRole("dialog")).getByText("DHIS2"));
    fireEvent.click(screen.getByRole("button", { name: "Configure credential" }));
    expect(screen.getByLabelText(/^Host URL/)).toBeTruthy();
  });

  it("saves a new credential, waits while it's saved, then closes the form", async () => {
    const host = draw("credentials", "Credentials");
    fillInNewDhis2();
    const [draft] = host.calls("onSaveCredential")[0]!;
    expect(draft).toMatchObject({ name: "Health ministry", schema: "dhis2" });
    expect(draft.environments[0]!.values).toMatchObject({ hostUrl: "https://play.dhis2.org", password: "district" });
    expect(screen.getByRole("button", { name: "Saving…" })).toBeTruthy();
    await host.resolve("onSaveCredential");
    expect(screen.queryByRole("button", { name: "Save credential" })).toBeNull();
  });

  it("keeps the form open with the server's reason when it refuses the credential", async () => {
    const host = draw("credentials", "Credentials");
    fillInNewDhis2();
    await host.reject("onSaveCredential", new Error("Name has already been taken."));
    expect(screen.getByText("Name has already been taken.")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Save credential" })).toBeTruthy();
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
