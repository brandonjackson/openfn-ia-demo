import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useParams } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
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
      <MemoryRouter initialEntries={["/projects"]}>
        <Routes>
          <Route path="/projects" element={<ProjectsPageQuery route={route} />} />
          <Route path="/projects/:id" element={<OpenedProject />} />
        </Routes>
      </MemoryRouter>
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
  });
  afterEach(() => setFlag("serviceCatalog", true));

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
    expect((await screen.findByRole("alert", {}, wait)).textContent).toBe("has already been taken");
    expect(screen.getByLabelText(/^Project name/)).toBeTruthy();
  });
});
