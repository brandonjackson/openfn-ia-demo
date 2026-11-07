import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import ApiProvider from "../../api/ApiProvider";
import { forgetCsrfToken, request } from "../../api/client";
import { findNodeByPath } from "../../app/ia-utils";
import { failNext, resetFakeApi, setWait } from "../../fake-api";
import { projectIdFor } from "../../fake-api/projects";
import { iaTree } from "../../model/ia-tree";
import ProjectSettingsPageQuery from "./ProjectSettingsPage.query";

const wait = { timeout: 3000 };
const projectId = projectIdFor("project-a");
const path = `/projects/${projectId}/settings`;

function renderRoute(hash = "") {
  const route = { ...findNodeByPath(iaTree, path)!, currentPath: path };
  render(
    <ApiProvider retry={false}>
      <MemoryRouter initialEntries={[path + hash]}>
        <Routes>
          <Route path="/projects/:project/settings" element={<ProjectSettingsPageQuery route={route} />} />
        </Routes>
      </MemoryRouter>
    </ApiProvider>,
  );
}

type Credentials = { credentials: { name: string; environments: { name: string }[] }[] };
type Exports = { data: { id: string; attributes: { state: string; filename: string | null } }[] };
type Me = { data: { attributes: { email: string } } };
type Members = { data: { attributes: { email: string } }[] };

describe("ProjectSettingsPageQuery", () => {
  beforeEach(() => {
    setWait(0);
    resetFakeApi();
    forgetCsrfToken();
  });

  afterEach(() => vi.restoreAllMocks());

  it("lists the credentials linked to the project, from the server", async () => {
    const { credentials } = await request<Credentials>("GET", `/api/projects/${projectId}/credentials`);
    expect(credentials.length).toBeGreaterThan(0);
    renderRoute("#credentials");
    for (const c of credentials) expect(await screen.findByText(c.name, {}, wait)).toBeTruthy();
  });

  it("still lists the credentials when their types can't be named", async () => {
    const { credentials } = await request<Credentials>("GET", `/api/projects/${projectId}/credentials`);
    failNext("GET /api/credential_schemas", { status: 503, code: "not_ready", detail: "Not ready." });
    renderRoute("#credentials");
    expect(await screen.findByText(credentials[0]!.name, {}, wait)).toBeTruthy();
  });

  it("marks you among the collaborators by the account the server says is signed in", async () => {
    const me = await request<Me>("GET", "/api/me");
    const members = await request<Members>("GET", `/api/projects/${projectId}/members`);
    expect(members.data.some((m) => m.attributes.email === me.data.attributes.email)).toBe(true);
    renderRoute("#collaboration");
    const row = (await screen.findByText(me.data.attributes.email, {}, wait)).closest("tr")!;
    expect(within(row).getByRole("button", { name: "Remove" }).getAttribute("title")).toBe("You cannot remove yourself");
  });

  it("exports the project as the YAML the server makes", async () => {
    const workflows = (await request<{ workflows: { name: string }[] }>("GET", `/api/projects/${projectId}/workflows`)).workflows;
    renderRoute();
    fireEvent.click(await screen.findByRole("button", { name: "Export project" }, wait));
    const dialog = await screen.findByRole("dialog", {}, wait);
    expect(dialog.textContent).toContain("workflows:");
    expect(dialog.textContent).toContain(`name: ${workflows[0]!.name}`);
  });

  it("says why the project didn't export when the server refuses", async () => {
    failNext("GET /api/provision/yaml", { status: 403, code: "forbidden", detail: "You are not allowed to do that." });
    renderRoute();
    fireEvent.click(await screen.findByRole("button", { name: "Export project" }, wait));
    expect((await screen.findByRole("alert", {}, wait)).textContent).toContain("You are not allowed to do that.");
  });

  it("downloads a finished export's file from the server", async () => {
    const { data } = await request<Exports>("GET", `/api/projects/${projectId}/history_exports`);
    const done = data.find((e) => e.attributes.state === "completed");
    expect(done).toBeTruthy();
    const saved: Blob[] = [];
    vi.spyOn(URL, "createObjectURL").mockImplementation((blob) => (saved.push(blob as Blob), "blob:export"));
    vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => {});
    renderRoute("#history-exports");
    const row = (await screen.findByText(done!.attributes.filename!, {}, wait)).closest("tr")!;
    fireEvent.click(within(row).getByRole("button", { name: "Download" }));
    await waitFor(() => expect(saved).toHaveLength(1), wait);
    const file = JSON.parse(await saved[0]!.text()) as { work_orders: unknown[] };
    expect(Array.isArray(file.work_orders)).toBe(true);
  });

  it("says why an export didn't download", async () => {
    const { data } = await request<Exports>("GET", `/api/projects/${projectId}/history_exports`);
    const done = data.find((e) => e.attributes.state === "completed")!;
    failNext("GET /api/projects/:project_id/history_exports/:id/download", { status: 404, code: "not_found", detail: "Not found." });
    renderRoute("#history-exports");
    const row = (await screen.findByText(done.attributes.filename!, {}, wait)).closest("tr")!;
    fireEvent.click(within(row).getByRole("button", { name: "Download" }));
    const alert = await screen.findByRole("alert", {}, wait);
    expect(alert.textContent).toContain(`${done.attributes.filename} didn't download`);
    expect(alert.textContent).toContain("Not found.");
  });
});
