import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import ApiProvider from "../../api/ApiProvider";
import { forgetCsrfToken, request } from "../../api/client";
import { setFlag } from "../../app/feature-flags";
import { findNodeByPath } from "../../app/ia-utils";
import { failNext, resetFakeApi, setWait } from "../../fake-api";
import { projectIdFor } from "../../fake-api/projects";
import { iaTree } from "../../model/ia-tree";
import InsightsPageQuery from "./InsightsPage.query";

const wait = { timeout: 3000 };
const projectId = projectIdFor("project-a");

function renderAt(path: string) {
  const route = { ...findNodeByPath(iaTree, path)!, currentPath: path };
  render(
    <ApiProvider retry={false}>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/projects/:project/insights" element={<InsightsPageQuery route={{ ...route, params: { project: projectId } }} />} />
          <Route path="/insights" element={<InsightsPageQuery route={route} />} />
        </Routes>
      </MemoryRouter>
    </ApiProvider>,
  );
}

type ApiProject = { id: string; attributes: { name: string; parent_id?: string | null; role?: string | null; scheduled_deletion?: string | null } };

describe("InsightsPageQuery", () => {
  beforeEach(() => {
    setWait(0);
    resetFakeApi();
    forgetCsrfToken();
    setFlag("organizations", true);
  });
  afterEach(() => setFlag("organizations", true));

  it("shows one project's week from the server, without the table", async () => {
    renderAt(`/projects/${projectId}/insights`);
    expect(await screen.findByText("Runs per day", {}, wait)).toBeTruthy();
    expect(screen.getByText("This project")).toBeTruthy();
    expect(screen.queryByText("By project")).toBeNull();
  });

  it("gives every project you can open a row across projects", async () => {
    const { data } = await request<{ data: ApiProject[] }>("GET", "/api/projects?include=stats&page_size=100");
    const mine = data.filter((p) => p.attributes.role && !p.attributes.scheduled_deletion && !p.attributes.parent_id);
    expect(mine.length).toBeGreaterThan(1);
    renderAt("/insights");
    expect(await screen.findByText("By project", {}, wait)).toBeTruthy();
    for (const p of mine) expect(screen.getByText(p.attributes.name)).toBeTruthy();
  });

  it("shows the server's message in the page's place when the work orders fail to load", async () => {
    failNext("GET /api/projects/:project_id/work_orders", { status: 500, code: "internal", detail: "Something went wrong in Lightning." });
    renderAt(`/projects/${projectId}/insights`);
    expect(await screen.findByText("Something went wrong in Lightning.", {}, wait)).toBeTruthy();
  });
});
