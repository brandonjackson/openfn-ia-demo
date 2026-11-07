import { fireEvent, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { FormError } from "../../model/form-error";
import { permissionsFor } from "../../model/project-settings";
import { renderPage } from "../../test/renderPage";
import ProjectSettingsPage, { type ProjectSettingsPageData, type ProjectSettingsPageProps } from "./ProjectSettingsPage";

const data: ProjectSettingsPageData = {
  projectId: "p",
  projectName: "intake",
  projectEnvironment: "main",
  projectDescription: "",
  permissions: permissionsFor("owner"),
  concurrencyDisabled: false,
  credentials: [],
  collections: [],
  webhookAuthMethods: [],
  webhookTriggers: [],
  collaborators: [],
  mfaRequired: false,
  github: { accountConnected: false, installations: [] },
  dataStorage: { retentionPeriod: "Keep forever", ioDataPolicy: "retain", ioRetentionPeriod: "Keep forever" },
  historyExports: [],
};

const actions = [
  "onSaveProjectIdentity",
  "onSaveConcurrency",
  "onExportProject",
  "onDeleteProject",
  "onCreateCollection",
  "onRenameCollection",
  "onDeleteCollection",
  "onPreviewCollection",
  "onCreateWebhookAuthMethod",
  "onUpdateWebhookAuthMethod",
  "onDeleteWebhookAuthMethod",
  "onAddCollaborators",
  "onInviteCollaborators",
  "onChangeCollaboratorRole",
  "onSetFailureAlert",
  "onSetDigest",
  "onRemoveCollaborator",
  "onSetMfaRequired",
  "onConnectGitHubAccount",
  "onConnectGitHub",
  "onInitiateGitHubSync",
  "onDisconnectGitHub",
  "onSaveDataStorage",
  "onCreateHistoryExport",
  "onDownloadHistoryExport",
] as const;

const draw = (more: Partial<ProjectSettingsPageData> = {}, initialSection?: string) =>
  renderPage(
    ProjectSettingsPage,
    {
      node: { id: "settings", label: "Settings", description: "View and manage project settings." },
      ancestors: [],
      currentPath: "/projects/p/settings",
      initialSection,
      data: { ...data, ...more },
    } satisfies Omit<ProjectSettingsPageProps, (typeof actions)[number]>,
    [...actions],
  );

describe("ProjectSettingsPage", () => {
  it("lists the project's credentials with each environment they have values for", () => {
    draw(
      {
        credentials: [
          { id: "c1", name: "dhis2-main", type: "DHIS2", adaptor: "dhis2", environments: ["production", "staging"], owner: "Ada Lovelace" },
          { id: "c2", name: "openmrs", type: "OpenMRS", environments: ["main"], owner: "Grace Hopper" },
        ],
      },
      "credentials",
    );
    const first = screen.getByText("dhis2-main").closest("tr")!;
    expect(within(first).getByText("DHIS2")).toBeTruthy();
    expect(within(first).getByText("Production")).toBeTruthy();
    expect(within(first).getByText("Staging")).toBeTruthy();
    expect(within(first).getByText("Ada Lovelace")).toBeTruthy();
    // An environment the badges don't know is shown by its name.
    expect(within(screen.getByText("openmrs").closest("tr")!).getByText("main")).toBeTruthy();
  });

  it("says when the project has no credentials", () => {
    draw({}, "credentials");
    expect(screen.getByText("No credentials in this project yet.")).toBeTruthy();
  });

  it("says it's exporting, then shows the project's YAML", async () => {
    const page = draw();
    fireEvent.click(screen.getByRole("button", { name: "Export project" }));
    const busy = screen.getByRole("button", { name: "Exporting…" });
    expect(busy.getAttribute("aria-disabled")).toBe("true");
    fireEvent.click(busy);
    expect(page.calls("onExportProject")).toHaveLength(1);
    await page.resolve("onExportProject", "name: intake\nworkflows:\n");
    expect(screen.getByRole("dialog", { name: "intake.yaml" })).toBeTruthy();
    expect(screen.getByText(/name: intake/)).toBeTruthy();
  });

  it("says why the project didn't export", async () => {
    const page = draw();
    fireEvent.click(screen.getByRole("button", { name: "Export project" }));
    await page.reject("onExportProject", new FormError("You are not allowed to do that."));
    expect(screen.getByRole("alert").textContent).toContain("You are not allowed to do that.");
    expect(screen.getByRole("button", { name: "Export project" })).toBeTruthy();
  });

  it("says it's downloading a finished export, and why it couldn't", async () => {
    const page = draw(
      { historyExports: [{ id: "e1", fileName: "intake-history.zip", requestedBy: "Ada Lovelace", createdAt: "1 Oct 2026, 09:00", status: "completed" }] },
      "history-exports",
    );
    fireEvent.click(screen.getByRole("button", { name: "Download" }));
    const busy = screen.getByRole("button", { name: "Downloading…" });
    expect(busy.getAttribute("aria-disabled")).toBe("true");
    fireEvent.click(busy);
    expect(page.calls("onDownloadHistoryExport")).toEqual([["e1"]]);
    await page.reject("onDownloadHistoryExport", new FormError("Not found."));
    expect(screen.getByRole("alert").textContent).toContain("intake-history.zip didn't download");
    expect(screen.getByRole("alert").textContent).toContain("Not found.");
    expect(screen.getByRole("button", { name: "Download" })).toBeTruthy();
  });

  it("says why an export wasn't made", async () => {
    const page = draw({}, "history-exports");
    fireEvent.click(screen.getByRole("button", { name: "Create export" }));
    await page.reject("onCreateHistoryExport", new FormError("You are not allowed to do that."));
    expect(screen.getByRole("alert").textContent).toContain("The export wasn't made");
    expect(screen.getByRole("alert").textContent).toContain("You are not allowed to do that.");
  });
});
