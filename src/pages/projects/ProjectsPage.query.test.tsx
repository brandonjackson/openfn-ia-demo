import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useParams } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { AnnouncementsProvider } from "../../app/announcements";
import ApiProvider from "../../api/ApiProvider";
import { forgetCsrfToken, request } from "../../api/client";
import { setFlag } from "../../app/feature-flags";
import { findNodeByPath } from "../../app/ia-utils";
import { failNext, resetFakeApi, setWait } from "../../fake-api";
import { projectIdFor } from "../../fake-api/projects";
import { iaTree } from "../../model/ia-tree";
import ProjectsPageQuery from "./ProjectsPage.query";

const wait = { timeout: 3000 };

function OpenedProject() {
  return <p>Opened {useParams()["id"]}</p>;
}

function renderRoute() {
  const route = { ...findNodeByPath(iaTree, "/projects")!, currentPath: "/projects" };
  render(
    <ApiProvider retry={false}>
      <AnnouncementsProvider>
        <MemoryRouter initialEntries={["/projects"]}>
          <Routes>
            <Route path="/projects" element={<ProjectsPageQuery route={route} />} />
            <Route path="/projects/:id" element={<OpenedProject />} />
          </Routes>
        </MemoryRouter>
      </AnnouncementsProvider>
    </ApiProvider>,
  );
}

/** The card for a project, found by its name. */
const card = async (name: string) => (await screen.findByText(name, {}, wait)).closest("a")!;

type Many = { data: { id: string; attributes: Record<string, unknown> }[] };

describe("ProjectsPageQuery", () => {
  beforeEach(() => {
    setWait(0);
    resetFakeApi();
    forgetCsrfToken();
    setFlag("serviceCatalog", true);
    setFlag("organizations", true);
  });
  afterEach(() => {
    setFlag("serviceCatalog", true);
    setFlag("organizations", true);
  });

  it("lists the projects you're a member of from the server, leaving out one scheduled for deletion", async () => {
    renderRoute();
    expect(await card("project-a")).toBeTruthy();
    expect(screen.queryByText("data-quality-checks")).toBeNull();
  });

  it("counts each project's services from the server, and shows none without the service catalog", async () => {
    const { data } = await request<Many>("GET", "/api/demo/services?page_size=100");
    const mine = data.filter((s) => s.attributes["project_id"] === projectIdFor("project-a"));
    const live = mine.filter((s) => s.attributes["status"] === "Live").length;
    renderRoute();
    expect(within(await card("project-a")).getByText(`${live}/${mine.length} services live`)).toBeTruthy();

    act(() => setFlag("serviceCatalog", false));
    await waitFor(() => expect(screen.queryByText(/services live/)).toBeNull(), wait);
    expect(await card("project-a")).toBeTruthy();
  });

  it("still lists the projects when their services can't load, with no counts rather than wrong ones", async () => {
    failNext("GET /api/demo/services", { status: 500, code: "internal", detail: "Something went wrong." });
    renderRoute();
    expect(await card("project-a")).toBeTruthy();
    expect(screen.queryByText(/services live|No services/)).toBeNull();
  });

  it("shows the server's message in the page's place when the list fails to load", async () => {
    failNext("GET /api/projects", { status: 500, code: "internal", detail: "Something went wrong in Lightning." });
    renderRoute();
    expect(await screen.findByText("Something went wrong in Lightning.", {}, wait)).toBeTruthy();
  });

  async function createProject(name: string) {
    fireEvent.click((await screen.findAllByRole("button", { name: "New project" }, wait))[0]!);
    fireEvent.change(screen.getByLabelText(/^Project name/), { target: { value: name } });
    fireEvent.click(screen.getByRole("button", { name: "Create project" }));
  }

  it("creates the project on the server and opens it", async () => {
    renderRoute();
    await createProject("Malaria Programme");
    const opened = await screen.findByText(/^Opened /, {}, wait);
    const id = opened.textContent!.replace("Opened ", "");
    const { data } = await request<Many>("GET", "/api/projects?include=stats&page_size=100");
    expect(data.find((p) => p.id === id)?.attributes).toMatchObject({ name: "malaria-programme", role: "owner" });
  });

  it("keeps the form open with the server's reason under Project name when it refuses the name", async () => {
    failNext("PUT /api/projects/:id", {
      status: 422,
      code: "invalid",
      detail: "The project could not be saved.",
      errors: [{ code: "taken", detail: "has already been taken", pointer: "#/name" }],
    });
    renderRoute();
    await createProject("payroll");
    await waitFor(() => expect(screen.getAllByRole("alert").map((a) => a.textContent)).toContain("has already been taken"), wait);
    expect(screen.getByLabelText(/^Project name/)).toBeTruthy();
  });

  it("lists the instance's other projects apart from yours, and leaves them out without Organizations", async () => {
    renderRoute();
    const others = await screen.findByRole("region", { name: "Other projects" }, wait);
    expect(within(others).getByText("immunization-registry")).toBeTruthy();
    expect(within(screen.getByRole("region", { name: "Your projects" })).getByText("project-a")).toBeTruthy();

    act(() => setFlag("organizations", false));
    await waitFor(() => expect(screen.queryByRole("region", { name: "Other projects" })).toBeNull(), wait);
  });

  it("asks to join another project on the server, says so, then shows Requested", async () => {
    renderRoute();
    const others = await screen.findByRole("region", { name: "Other projects" }, wait);
    fireEvent.click(within(others).getAllByRole("button", { name: "Request to join" })[0]!);
    expect(await screen.findByText("Asked to join immunization-registry.", {}, wait)).toBeTruthy();
    await waitFor(() => expect(within(others).getByText("Requested")).toBeTruthy(), wait);
    const { data } = await request<Many>("GET", "/api/demo/projects/others");
    expect(data.find((p) => p.attributes["name"] === "immunization-registry")?.attributes["join_requested"]).toBe(true);
  });

  it("says why when the server refuses a request to join", async () => {
    failNext("POST /api/demo/projects/:project_id/join_requests", { status: 409, code: "already_member", detail: "You're already a member of this project." });
    renderRoute();
    const others = await screen.findByRole("region", { name: "Other projects" }, wait);
    fireEvent.click(within(others).getAllByRole("button", { name: "Request to join" })[0]!);
    const alert = await screen.findByRole("alert", {}, wait);
    expect(within(alert).getByText("You're already a member of this project.")).toBeTruthy();
  });

  it("makes a copy of a project on the server, says so, and lists it under Your projects", async () => {
    renderRoute();
    const yours = await screen.findByRole("region", { name: "Your projects" }, wait);
    fireEvent.click(within(yours).getByRole("button", { name: "Actions for project-a" }));
    fireEvent.click(screen.getByRole("menuitem", { name: "Make a copy" }));
    expect(await screen.findByText("Made project-a-copy.", {}, wait)).toBeTruthy();
    expect(await card("project-a-copy")).toBeTruthy();
  });
});
